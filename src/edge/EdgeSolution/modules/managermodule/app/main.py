# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import importlib
if not importlib.util.find_spec('common'):
    import sys
    sys.path.append('../../common')

import os
import time
import json
import httpx
import logging
from common.symphony_objects import SkillSpec, ModelSpec, InstanceSpec
from common.symphony_agent_client import SymphonyAgentClient
from common.voe_cascade_config import CascadeConfig, Node, Edge
from common.voe_model_config import ModelConfig
from common.voe_ipc import PredictModule, StreamingModule
from common.voe_status import StatusEnum

#logging.basicConfig(level=logging.DEBUG)

last_skills = {
}

client = SymphonyAgentClient()

STATUS_RUNNING = '0'
STATUS_INITIALIZE_MANAGERMODULE = '1'
STATUS_UNITIALIZE_PREDICTMODULE = '2'
STATUS_INITIALIZE_STREAMINGMODULE = '3'

def process_skill(skill):



    skill_spec = SkillSpec(**skill['spec'])

    nodes = []
    edges = []
    model_configs = []

    for skill_node in skill_spec.nodes:
        
        logging.debug(skill_node)
        
        if skill_node.type == 'model':

            # skill_node.name is symphony's model name 
            # we need to send a request to get more information from symphony model
            # and then parse the model.type / subtype / project 


            # symphony_model & symphony_model_spec is the term from symphony
            # model_name, model_provider, model_executor, model_type is the term from ModelConfig

            symphony_model_name = skill_node.name
            model_name = skill_node.name
            model = client.get_model(model_name)
    
            symphony_model_spec = ModelSpec(**model['spec'])
            print('s -->', symphony_model_spec)

            model_executor, model_type = symphony_model_spec.properties.model_subtype.split('.')
            #FIXME 
            if model_executor == 'intel': 
                model_executor = 'openvino'
                #FIXME
                model_name = symphony_model_spec.properties.model_project

            model_provider = symphony_model_spec.properties.model_type

            #print('-->', model_executor, model_type)
            #exit()
            model_config = ModelConfig(
                name=model_name,
                provider=model_provider,
                executor=model_executor,
                type=model_type,
            )

     
            if model_config.provider == 'customvision' and \
                model_config.executor == 'customvision' and \
                model_config.type == 'ObjectDetection':
                
                while True:
                    try:
                        res = client.export_model(model_name)
                        logging.debug(res)
                        if len(res) > 0:
                            m = res[0]
                            if m['status'] == 'Exporting':
                                print('Exporting Model')
                            elif m['status'] == 'Done':
                                download_uri = m['downloadUri']
                                break
                                
                    except Exception as e:
                        print(e)
                        
                    time.sleep(3)
                    
                else:
                    raise Exception('Unknown subtype {skill_node.sub_type} for customvision')

                print('Got Download URI', download_uri)
                model_config.download_uri = download_uri

            model_configs.append(model_config)
                

            if model_type == 'ObjectDetection':
                node_name = 'object_detection_model'
            elif model_type == 'Classification':
                node_name = 'classification_model'

            
            if skill_node.configurations is not None:
                configurations = skill_node.configurations.copy()
            else:
                configurations = {}
            configurations['model'] = model_name
            configurations['symphony_name'] = symphony_model_name
            configurations['provider'] = model_provider
            
            node = Node(
                id=skill_node.id,
                type='model',
                name=node_name,
                configurations=configurations
            )
            

        else:
            node = Node(
                id=skill_node.id,
                type=skill_node.type,
                name=skill_node.name,
                configurations=skill_node.configurations or {}
            )

        nodes.append(node)


    for skill_edge in skill_spec.edges:
        edge = Edge(
            source=skill_edge.source.node,
            target=skill_edge.target.node
        )
        edges.append(edge)

    cascade_config = CascadeConfig(edges=edges, nodes=nodes)

    return cascade_config, model_configs

if __name__ == '__main__':


    
    
    raw_aiskills = os.environ.get('AISKILLS')
    instance_name = os.environ.get('INSTANCE')

    # update status
    client.post_instance_status(instance_name, STATUS_INITIALIZE_MANAGERMODULE, "init manager module")

    
    instance = client.get_instance(instance_name)
    instance_spec = InstanceSpec(**instance['spec'])
    print(instance_spec)

    

    print('ok', flush=True)
    
    cascade_configs = []
    model_configs = []

    for skill_with_alias in json.loads(raw_aiskills):
        skill_name, skill_alias = skill_with_alias.split(" as ")
        #skill = client.get_skill(skill_name)
        skill = client.get_skill_with_instance_name_and_alias(skill_name, instance_name, skill_alias)
        print(f'skill_name: {skill_name}, skill_alias: {skill_alias}', flush=True)
        print(skill, flush=True)
        new_cascade_config, new_model_configs = process_skill(skill)

        cascade_configs.append(new_cascade_config)
        model_configs += new_model_configs

 
    streamingmodule_setting = StreamingModule.Setting(cascade_configs=cascade_configs)
    predictmodule_setting = PredictModule.Setting(model_configs=model_configs)
    
    

    while True:
        try:
            print('------------------------------------------------------------')
            print('  Getting status from StreamingModule and PredictModule ...', flush=True)
            print('------------------------------------------------------------')
            res = httpx.get(PredictModule.Url+'/status')
            predict_module_status = PredictModule.Status(**res.json())
            
            res = httpx.get(StreamingModule.Url+'/status')
            streaming_module_status = StreamingModule.Status(**res.json())

            print()
            print(f'  Predict   Module: {predict_module_status.status}')
            print(f'  Streaming Module: {streaming_module_status.status}')
            print()
        except:
            
            time.sleep(3)
            continue

        
        if predict_module_status.status == StatusEnum.WAITING:

            # update status
            client.post_instance_status(instance_name, STATUS_INITIALIZE_STREAMINGMODULE, "init streaming module")

            print('-----------------------------------------------')
            print('  sending model_configs to predictmodule ...')
            print('-----------------------------------------------')
            print()
            print(model_configs)
            print()
            httpx.post(PredictModule.Url+'/set', data=predictmodule_setting.json())

        elif predict_module_status.status == StatusEnum.RUNNING and streaming_module_status.status == StatusEnum.WAITING:

            # update status
            client.post_instance_status(instance_name, STATUS_INITIALIZE_STREAMINGMODULE, 'init streaming module')

            print('------------------------------------------------------------')
            print('  sending cascade_configs to predictmodule ...')
            print('------------------------------------------------------------')
            print()
            print(cascade_configs)
            print()
            httpx.post(StreamingModule.Url+'/set', data=streamingmodule_setting.json())

        else:
            # update status
            client.post_instance_status(instance_name, STATUS_RUNNING, 'running')

   
        time.sleep(3)
    

