# coding=utf-8
# *** WARNING: this file was generated by Pulumi SDK Generator. ***
# *** Do not edit by hand unless you're certain you know what you are doing! ***

import copy
import warnings
import sys
import pulumi
import pulumi.runtime
from typing import Any, Mapping, Optional, Sequence, Union, overload
if sys.version_info >= (3, 11):
    from typing import NotRequired, TypedDict, TypeAlias
else:
    from typing_extensions import NotRequired, TypedDict, TypeAlias
from . import _utilities

__all__ = ['AssistantArgs', 'Assistant']

@pulumi.input_type
class AssistantArgs:
    def __init__(__self__, *,
                 model: pulumi.Input[str],
                 name: pulumi.Input[str],
                 file_ids: Optional[pulumi.Input[Sequence[pulumi.Input[str]]]] = None,
                 instructions: Optional[pulumi.Input[str]] = None,
                 metadata: Optional[pulumi.Input[Mapping[str, pulumi.Input[str]]]] = None,
                 tools: Optional[pulumi.Input[Sequence[pulumi.Input[Mapping[str, pulumi.Input[str]]]]]] = None):
        """
        The set of arguments for constructing a Assistant resource.
        :param pulumi.Input[str] model: The model that the assistant will use (e.g., gpt-4, gpt-3.5-turbo).
        :param pulumi.Input[str] name: The name of the assistant.
        :param pulumi.Input[Sequence[pulumi.Input[str]]] file_ids: A list of file IDs attached to this assistant.
        :param pulumi.Input[str] instructions: The system instructions that the assistant uses.
        :param pulumi.Input[Mapping[str, pulumi.Input[str]]] metadata: Set of key-value pairs that can be used to store additional information about the assistant.
        :param pulumi.Input[Sequence[pulumi.Input[Mapping[str, pulumi.Input[str]]]]] tools: A list of tools enabled on the assistant.
        """
        pulumi.set(__self__, "model", model)
        pulumi.set(__self__, "name", name)
        if file_ids is not None:
            pulumi.set(__self__, "file_ids", file_ids)
        if instructions is not None:
            pulumi.set(__self__, "instructions", instructions)
        if metadata is not None:
            pulumi.set(__self__, "metadata", metadata)
        if tools is not None:
            pulumi.set(__self__, "tools", tools)

    @property
    @pulumi.getter
    def model(self) -> pulumi.Input[str]:
        """
        The model that the assistant will use (e.g., gpt-4, gpt-3.5-turbo).
        """
        return pulumi.get(self, "model")

    @model.setter
    def model(self, value: pulumi.Input[str]):
        pulumi.set(self, "model", value)

    @property
    @pulumi.getter
    def name(self) -> pulumi.Input[str]:
        """
        The name of the assistant.
        """
        return pulumi.get(self, "name")

    @name.setter
    def name(self, value: pulumi.Input[str]):
        pulumi.set(self, "name", value)

    @property
    @pulumi.getter(name="fileIds")
    def file_ids(self) -> Optional[pulumi.Input[Sequence[pulumi.Input[str]]]]:
        """
        A list of file IDs attached to this assistant.
        """
        return pulumi.get(self, "file_ids")

    @file_ids.setter
    def file_ids(self, value: Optional[pulumi.Input[Sequence[pulumi.Input[str]]]]):
        pulumi.set(self, "file_ids", value)

    @property
    @pulumi.getter
    def instructions(self) -> Optional[pulumi.Input[str]]:
        """
        The system instructions that the assistant uses.
        """
        return pulumi.get(self, "instructions")

    @instructions.setter
    def instructions(self, value: Optional[pulumi.Input[str]]):
        pulumi.set(self, "instructions", value)

    @property
    @pulumi.getter
    def metadata(self) -> Optional[pulumi.Input[Mapping[str, pulumi.Input[str]]]]:
        """
        Set of key-value pairs that can be used to store additional information about the assistant.
        """
        return pulumi.get(self, "metadata")

    @metadata.setter
    def metadata(self, value: Optional[pulumi.Input[Mapping[str, pulumi.Input[str]]]]):
        pulumi.set(self, "metadata", value)

    @property
    @pulumi.getter
    def tools(self) -> Optional[pulumi.Input[Sequence[pulumi.Input[Mapping[str, pulumi.Input[str]]]]]]:
        """
        A list of tools enabled on the assistant.
        """
        return pulumi.get(self, "tools")

    @tools.setter
    def tools(self, value: Optional[pulumi.Input[Sequence[pulumi.Input[Mapping[str, pulumi.Input[str]]]]]]):
        pulumi.set(self, "tools", value)


class Assistant(pulumi.CustomResource):
    @overload
    def __init__(__self__,
                 resource_name: str,
                 opts: Optional[pulumi.ResourceOptions] = None,
                 file_ids: Optional[pulumi.Input[Sequence[pulumi.Input[str]]]] = None,
                 instructions: Optional[pulumi.Input[str]] = None,
                 metadata: Optional[pulumi.Input[Mapping[str, pulumi.Input[str]]]] = None,
                 model: Optional[pulumi.Input[str]] = None,
                 name: Optional[pulumi.Input[str]] = None,
                 tools: Optional[pulumi.Input[Sequence[pulumi.Input[Mapping[str, pulumi.Input[str]]]]]] = None,
                 __props__=None):
        """
        Create a Assistant resource with the given unique name, props, and options.
        :param str resource_name: The name of the resource.
        :param pulumi.ResourceOptions opts: Options for the resource.
        :param pulumi.Input[Sequence[pulumi.Input[str]]] file_ids: A list of file IDs attached to this assistant.
        :param pulumi.Input[str] instructions: The system instructions that the assistant uses.
        :param pulumi.Input[Mapping[str, pulumi.Input[str]]] metadata: Set of key-value pairs that can be used to store additional information about the assistant.
        :param pulumi.Input[str] model: The model that the assistant will use (e.g., gpt-4, gpt-3.5-turbo).
        :param pulumi.Input[str] name: The name of the assistant.
        :param pulumi.Input[Sequence[pulumi.Input[Mapping[str, pulumi.Input[str]]]]] tools: A list of tools enabled on the assistant.
        """
        ...
    @overload
    def __init__(__self__,
                 resource_name: str,
                 args: AssistantArgs,
                 opts: Optional[pulumi.ResourceOptions] = None):
        """
        Create a Assistant resource with the given unique name, props, and options.
        :param str resource_name: The name of the resource.
        :param AssistantArgs args: The arguments to use to populate this resource's properties.
        :param pulumi.ResourceOptions opts: Options for the resource.
        """
        ...
    def __init__(__self__, resource_name: str, *args, **kwargs):
        resource_args, opts = _utilities.get_resource_args_opts(AssistantArgs, pulumi.ResourceOptions, *args, **kwargs)
        if resource_args is not None:
            __self__._internal_init(resource_name, opts, **resource_args.__dict__)
        else:
            __self__._internal_init(resource_name, *args, **kwargs)

    def _internal_init(__self__,
                 resource_name: str,
                 opts: Optional[pulumi.ResourceOptions] = None,
                 file_ids: Optional[pulumi.Input[Sequence[pulumi.Input[str]]]] = None,
                 instructions: Optional[pulumi.Input[str]] = None,
                 metadata: Optional[pulumi.Input[Mapping[str, pulumi.Input[str]]]] = None,
                 model: Optional[pulumi.Input[str]] = None,
                 name: Optional[pulumi.Input[str]] = None,
                 tools: Optional[pulumi.Input[Sequence[pulumi.Input[Mapping[str, pulumi.Input[str]]]]]] = None,
                 __props__=None):
        opts = pulumi.ResourceOptions.merge(_utilities.get_resource_opts_defaults(), opts)
        if not isinstance(opts, pulumi.ResourceOptions):
            raise TypeError('Expected resource options to be a ResourceOptions instance')
        if opts.id is None:
            if __props__ is not None:
                raise TypeError('__props__ is only valid when passed in combination with a valid opts.id to get an existing resource')
            __props__ = AssistantArgs.__new__(AssistantArgs)

            __props__.__dict__["file_ids"] = file_ids
            __props__.__dict__["instructions"] = instructions
            __props__.__dict__["metadata"] = metadata
            if model is None and not opts.urn:
                raise TypeError("Missing required property 'model'")
            __props__.__dict__["model"] = model
            if name is None and not opts.urn:
                raise TypeError("Missing required property 'name'")
            __props__.__dict__["name"] = name
            __props__.__dict__["tools"] = tools
            __props__.__dict__["created_at"] = None
            __props__.__dict__["id"] = None
            __props__.__dict__["object"] = None
        super(Assistant, __self__).__init__(
            'openai:index:Assistant',
            resource_name,
            __props__,
            opts)

    @staticmethod
    def get(resource_name: str,
            id: pulumi.Input[str],
            opts: Optional[pulumi.ResourceOptions] = None) -> 'Assistant':
        """
        Get an existing Assistant resource's state with the given name, id, and optional extra
        properties used to qualify the lookup.

        :param str resource_name: The unique name of the resulting resource.
        :param pulumi.Input[str] id: The unique provider ID of the resource to lookup.
        :param pulumi.ResourceOptions opts: Options for the resource.
        """
        opts = pulumi.ResourceOptions.merge(opts, pulumi.ResourceOptions(id=id))

        __props__ = AssistantArgs.__new__(AssistantArgs)

        __props__.__dict__["created_at"] = None
        __props__.__dict__["file_ids"] = None
        __props__.__dict__["id"] = None
        __props__.__dict__["instructions"] = None
        __props__.__dict__["metadata"] = None
        __props__.__dict__["model"] = None
        __props__.__dict__["name"] = None
        __props__.__dict__["object"] = None
        __props__.__dict__["tools"] = None
        return Assistant(resource_name, opts=opts, __props__=__props__)

    @property
    @pulumi.getter(name="createdAt")
    def created_at(self) -> pulumi.Output[float]:
        """
        The Unix timestamp (in seconds) for when the assistant was created.
        """
        return pulumi.get(self, "created_at")

    @property
    @pulumi.getter(name="fileIds")
    def file_ids(self) -> pulumi.Output[Optional[Sequence[str]]]:
        """
        A list of file IDs attached to this assistant.
        """
        return pulumi.get(self, "file_ids")

    @property
    @pulumi.getter
    def id(self) -> pulumi.Output[str]:
        """
        The unique identifier for the assistant.
        """
        return pulumi.get(self, "id")

    @property
    @pulumi.getter
    def instructions(self) -> pulumi.Output[Optional[str]]:
        """
        The system instructions that the assistant uses.
        """
        return pulumi.get(self, "instructions")

    @property
    @pulumi.getter
    def metadata(self) -> pulumi.Output[Optional[Mapping[str, str]]]:
        """
        Set of key-value pairs that can be used to store additional information about the assistant.
        """
        return pulumi.get(self, "metadata")

    @property
    @pulumi.getter
    def model(self) -> pulumi.Output[str]:
        """
        The model that the assistant uses.
        """
        return pulumi.get(self, "model")

    @property
    @pulumi.getter
    def name(self) -> pulumi.Output[str]:
        """
        The name of the assistant.
        """
        return pulumi.get(self, "name")

    @property
    @pulumi.getter
    def object(self) -> pulumi.Output[str]:
        """
        The object type, which is always 'assistant'.
        """
        return pulumi.get(self, "object")

    @property
    @pulumi.getter
    def tools(self) -> pulumi.Output[Optional[Sequence[Mapping[str, str]]]]:
        """
        A list of tools enabled on the assistant.
        """
        return pulumi.get(self, "tools")

