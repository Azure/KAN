# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import os
import sys
import subprocess
import json
from pathlib import Path
from enum import Enum

import typer
import dotenv
from pydantic import BaseModel, Field
import semantic_version



# Prepare Environment Variables
dotenv.load_dotenv('EdgeSolution/.env')
CONTAINER_REGISTRY_NAME=os.environ['CONTAINER_REGISTRY_NAME']

MODULE_ROOT = Path('EdgeSolution/modules')
ABSOLUTE_MODULE_ROOT = Path(os.path.abspath(MODULE_ROOT))
PLATFORM = 'amd64' #FIXME this shouldn't be fixed value

MODULES = []
for module_folder in os.listdir(MODULE_ROOT):
    if module_folder == '.DS_Store': continue
    if module_folder == 'common': continue
    if not os.path.exists(MODULE_ROOT/module_folder/'module.json'):
        typer.echo(f'***')
        typer.echo(f'*** module.json not found in {module_folder}')
        typer.echo(f'***')
        typer.Exit()
    MODULES.append(module_folder)


class IoTEdgeModule:
    def __init__(self, module_name):
        self.path = Path(os.path.abspath(MODULE_ROOT/module_name))
        with open(self.path/'module.json') as f:
            module = json.load(f)
        self.repository = module['image']['repository']
        self.repository = self.repository.replace('${CONTAINER_REGISTRY_NAME}', CONTAINER_REGISTRY_NAME)
        #FIXME might have multiple tags due to different version and platform
        self.version = module['image']['tag']['version']
        self.platforms = module['image']['tag']['platforms']


    def get_dockerfile_by_platform(self, platform):
        if platform not in self.platforms:
            raise Exception(f'Unsupported platform {platform}')

        dockerfile = self.platforms[platform]
        if dockerfile[0] == '.': dockerfile = dockerfile[2:]

        return self.path/dockerfile


    def get_tag_by_platform(self, platform):
        return f'{self.repository}:{self.version}-{platform}'


    def get_supported_platform(self):
        return list(p for p in self.platforms)


class Docker:
    @classmethod
    def _do(cls, command):
        try:
            ret = subprocess.check_call(command.split())
        except:
            typer.echo(f'***')
            typer.echo(f'*** Unexpected error {sys.exc_info()[1]}')
            typer.echo(f'***')

    @classmethod
    def build(cls, dockerfile_path, tag, folder):
        command = f'docker build --rm -f {dockerfile_path} -t {tag} {folder}'
        print(command)
        cls._do(command)

    @classmethod
    def push(cls, tag):
        command = f'docker push {tag}'
        cls._do(command)


app = typer.Typer()


def build_module(module_name):
    typer.echo(f'***')
    typer.echo(f'*** Building {module_name}')
    typer.echo(f'***')

    #FIXME add platform and accelerator
    #platform = PLATFORM

    #module = IoTEdgeModule(module_name)
    #dockerfile = module.get_dockerfile_by_platform(platform)
    #tag = module.get_tag_by_platform(platform)

    # use module root instead of module.path since we need to copy common folder
    #Docker.build(dockerfile, tag, ABSOLUTE_MODULE_ROOT)

    #FIXME
    module = IoTEdgeModule(module_name)
    #platforms = ['openvinoamd64']
    platforms = [PLATFORM]
    if module_name == 'predictmodule':
        platforms.append('gpuamd64')
        platforms.append('openvinoamd64')
        pass
    if module_name == 'symphonyai' and PLATFORM == 'amd64':
        platforms.append('gpuamd64')
        platforms.append('openvinoamd64')
    for platform in platforms:
        dockerfile = module.get_dockerfile_by_platform(platform)
        tag = module.get_tag_by_platform(platform)

        # use module root instead of module.path since we need to copy common folder
        Docker.build(dockerfile, tag, ABSOLUTE_MODULE_ROOT)



def push_module(module_name):
    typer.echo(f'***')
    typer.echo(f'*** Pushing {module_name}')
    typer.echo(f'***')

    #FIXME add platform and accelerator
    #platform = PLATFORM

    #module = IoTEdgeModule(module_name)
    #dockerfile = module.get_dockerfile_by_platform(platform)
    #tag = module.get_tag_by_platform(platform)

    #Docker.push(tag)

    module = IoTEdgeModule(module_name)
    #platforms = ['openvinoamd64']
    platforms = [PLATFORM]
    if module_name == 'predictmodule':
        platforms.append('gpuamd64')
        platforms.append('openvinoamd64')
        pass
    if module_name == 'symphonyai' and PLATFORM == 'amd64':
        platforms.append('gpuamd64')
        platforms.append('openvinoamd64')
    for platform in platforms:
        module = IoTEdgeModule(module_name)
        dockerfile = module.get_dockerfile_by_platform(platform)
        tag = module.get_tag_by_platform(platform)

        Docker.push(tag)

def module_version(module_name):

    module = IoTEdgeModule(module_name)
    return module.version
     


@app.command()
def build(name: str):

    if name not in MODULES:
        typer.echo(f'***')
        typer.echo(f'*** Uknown Module {name}')
        typer.echo(f'***')
        raise typer.Exit()

    build_module(name)


@app.command()
def build_all():
    for module_name in MODULES:
        build_module(module_name)


@app.command()
def push(name: str):

    if name not in MODULES:
        typer.echo(f'***')
        typer.echo(f'*** Unknown Module {name}')
        typer.echo(f'***')
        raise typer.Exit()

    push_module(name)


@app.command()
def push_all():
    for module_name in MODULES:
        push_module(module_name)


@app.command()
def list_versions():
    typer.echo(f'***')
    typer.echo(f'*** Modules')
    typer.echo(f'***')
    for module_name in MODULES:
        version = module_version(module_name)
        typer.echo(f'{module_name: <20}: {version}')

@app.command()
def list_modules():
    typer.echo(f'***')
    typer.echo(f'*** Modules')
    typer.echo(f'***')
    platform = PLATFORM
    for module_name in MODULES:
        module = IoTEdgeModule(module_name)
        
        tag = module.get_tag_by_platform(platform)
        typer.echo(f'{module_name: <20}: {tag}')





class VersionType(str, Enum):
    #MAJOR = 'major'
    MINOR = 'minor'
    PATCH = 'patch'
    DEV = 'dev'

@app.command()
def update_versions(type: VersionType, y: bool=typer.Option(default=False)):
    typer.echo(f'***')
    typer.echo(f'*** Update Versions')
    typer.echo(f'***')

    semvers = []
    for module_name in MODULES:
        version = module_version(module_name) 
        semvers.append(semantic_version.Version(version))

    new_semver = semantic_version.Version(str(max(semvers)))
    if type is VersionType.MINOR:
        new_semver = new_semver.next_minor()
    elif type is VersionType.PATCH:
        new_semver = new_semver.next_patch()
    elif type is VersionType.DEV:
        if len(new_semver.prerelease) == 0:
            new_semver.prerelease = ('dev', '1')
        else:
            new_semver.prerelease = ('dev', str(int(new_semver.prerelease[1])+1))

    typer.echo ('---------------------------------')
    for module_name, semver in zip(MODULES, semvers):
        typer.echo(f'{module_name: <20}: {semver} => {new_semver}')
    typer.echo ('---------------------------------')

    if not y:
        while True:
            ok = typer.prompt('Is it ok? (y/n)')
            if ok == 'y': 
                y = True
                break
            elif ok == 'n': 
                n = False
                break

    if y:
        for module_name, semver in zip(MODULES, semvers):
            command = f"sed -i -e s/{semver}/{new_semver}/g {MODULE_ROOT}/{module_name}/module.json"
            subprocess.check_output(command.split())


if __name__ == '__main__':
    app()
