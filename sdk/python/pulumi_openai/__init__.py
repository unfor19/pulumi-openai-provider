# coding=utf-8
# *** WARNING: this file was generated by Pulumi SDK Generator. ***
# *** Do not edit by hand unless you're certain you know what you are doing! ***

from . import _utilities
import typing
# Export this package's modules as members:
from .assistant import *
from .project import *
from .provider import *
from .vector_store import *

# Make subpackages available:
if typing.TYPE_CHECKING:
    import pulumi_openai.config as __config
    config = __config
else:
    config = _utilities.lazy_import('pulumi_openai.config')

_utilities.register(
    resource_modules="""
[
 {
  "pkg": "openai",
  "mod": "index",
  "fqn": "pulumi_openai",
  "classes": {
   "openai:index:Assistant": "Assistant",
   "openai:index:Project": "Project",
   "openai:index:VectorStore": "VectorStore"
  }
 }
]
""",
    resource_packages="""
[
 {
  "pkg": "openai",
  "token": "pulumi:providers:openai",
  "fqn": "pulumi_openai",
  "class": "Provider"
 }
]
"""
)
