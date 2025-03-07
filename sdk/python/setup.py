# coding=utf-8
# *** WARNING: this file was generated by Pulumi SDK Generator. ***
# *** Do not edit by hand unless you're certain you know what you are doing! ***

import errno
from setuptools import setup, find_packages
from setuptools.command.install import install
from subprocess import check_call


VERSION = "0.0.0"
def readme():
    try:
        with open('README.md', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return "openai Pulumi Package - Development Version"


setup(name='pulumi_openai',
      python_requires='>=3.9',
      version=VERSION,
      description="A Pulumi provider for managing OpenAI resources.",
      long_description=readme(),
      long_description_content_type='text/markdown',
      keywords='pulumi openai ai assistant vector-store category/ai',
      packages=find_packages(),
      package_data={
          'pulumi_openai': [
              'py.typed',
              'pulumi-plugin.json',
          ]
      },
      install_requires=[
          'openai>=1.0.0,<2.0.0',
          'parver>=0.2.1',
          'pulumi>=3.0.0,<4.0.0',
          'semver>=2.8.1',
          'typing-extensions>=4.11,<5; python_version < "3.11"'
      ],
      zip_safe=False)
