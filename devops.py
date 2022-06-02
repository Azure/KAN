import os
import sys
import subprocess
import json
from pathlib import Path

import typer
import dotenv
from pydantic import BaseModel, Field



# Prepare Environment Variables
dotenv.load_dotenv('EdgeSolution/.env')
CONTAINER_REGISTRY_NAME=os.environ['CONTAINER_REGISTRY_NAME']

MODULE_ROOT = Path('EdgeSolution/modules')
PLATFORM = 'amd64' #FIXME this shouldn't be fixed value


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
            output = subprocess.check_output(command.split())
        except:
            typer.echo(f'***')
            typer.echo(f'*** Unexpected error {sys.exc_info()[1]}')
            typer.echo(f'***')

    @classmethod
    def build(cls, dockerfile_path, tag, folder):
        command = f'docker build --rm -f {dockerfile_path} -t {tag} {folder}'
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
    platform = PLATFORM

    module = IoTEdgeModule(module_name)
    dockerfile = module.get_dockerfile_by_platform(platform)
    tag = module.get_tag_by_platform(platform)

    Docker.build(dockerfile, tag, module.path)



def push_module(module_name):
    typer.echo(f'***')
    typer.echo(f'*** Pushing {module_name}')
    typer.echo(f'***')

    #FIXME add platform and accelerator
    platform = PLATFORM

    module = IoTEdgeModule(module_name)
    dockerfile = module.get_dockerfile_by_platform(platform)
    tag = module.get_tag_by_platform(platform)

    Docker.push(tag)

def module_version(module_name):

    module = IoTEdgeModule(module_name)
    return module.version
     


MODULES = ['StreamingModule']

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
        typer.echo(f'{module_name}: {version}')



if __name__ == '__main__':
    app()
