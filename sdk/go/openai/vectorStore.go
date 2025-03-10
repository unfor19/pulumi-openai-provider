// Code generated by Pulumi SDK Generator DO NOT EDIT.
// *** WARNING: Do not edit by hand unless you're certain you know what you are doing! ***

package openai

import (
	"context"
	"reflect"

	"errors"
	"github.com/pulumi/pulumi-openai/sdk/go/openai/internal"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

type VectorStore struct {
	pulumi.CustomResourceState

	// Optional OpenAI API key used for this specific resource.
	ApiKey pulumi.StringPtrOutput `pulumi:"apiKey"`
	// The Unix timestamp (in seconds) for when the vector store was created.
	CreatedAt pulumi.Float64Output `pulumi:"createdAt"`
	// The expiration policy for the vector store.
	ExpiresAfter pulumi.StringMapOutput `pulumi:"expiresAfter"`
	// The Unix timestamp (in seconds) for when the vector store will expire.
	ExpiresAt pulumi.Float64PtrOutput `pulumi:"expiresAt"`
	// The number of cancelled files in this vector store.
	FileCountCancelled pulumi.Float64PtrOutput `pulumi:"fileCountCancelled"`
	// Counts of files in the vector store by status.
	FileCounts pulumi.StringMapOutput `pulumi:"fileCounts"`
	// A list of file IDs used in the vector store.
	FileIds pulumi.StringArrayOutput `pulumi:"fileIds"`
	// The unique identifier for the vector store.
	Id pulumi.StringOutput `pulumi:"id"`
	// The Unix timestamp (in seconds) for when the vector store was last active.
	LastActiveAt pulumi.Float64PtrOutput `pulumi:"lastActiveAt"`
	// Set of key-value pairs that can be used to store additional information about the vector store.
	Metadata pulumi.StringMapOutput `pulumi:"metadata"`
	// The name of the vector store.
	Name pulumi.StringOutput `pulumi:"name"`
	// The object type, which is always 'vector_store'.
	Object pulumi.StringOutput `pulumi:"object"`
	// The status of the vector store (e.g., 'completed', 'in_progress').
	Status pulumi.StringOutput `pulumi:"status"`
	// The number of bytes used by the vector store.
	UsageBytes pulumi.Float64PtrOutput `pulumi:"usageBytes"`
}

// NewVectorStore registers a new resource with the given unique name, arguments, and options.
func NewVectorStore(ctx *pulumi.Context,
	name string, args *VectorStoreArgs, opts ...pulumi.ResourceOption) (*VectorStore, error) {
	if args == nil {
		return nil, errors.New("missing one or more required arguments")
	}

	if args.Name == nil {
		return nil, errors.New("invalid value for required argument 'Name'")
	}
	if args.ApiKey != nil {
		args.ApiKey = pulumi.ToSecret(args.ApiKey).(pulumi.StringPtrInput)
	}
	secrets := pulumi.AdditionalSecretOutputs([]string{
		"apiKey",
	})
	opts = append(opts, secrets)
	opts = internal.PkgResourceDefaultOpts(opts)
	var resource VectorStore
	err := ctx.RegisterResource("openai:index:VectorStore", name, args, &resource, opts...)
	if err != nil {
		return nil, err
	}
	return &resource, nil
}

// GetVectorStore gets an existing VectorStore resource's state with the given name, ID, and optional
// state properties that are used to uniquely qualify the lookup (nil if not required).
func GetVectorStore(ctx *pulumi.Context,
	name string, id pulumi.IDInput, state *VectorStoreState, opts ...pulumi.ResourceOption) (*VectorStore, error) {
	var resource VectorStore
	err := ctx.ReadResource("openai:index:VectorStore", name, id, state, &resource, opts...)
	if err != nil {
		return nil, err
	}
	return &resource, nil
}

// Input properties used for looking up and filtering VectorStore resources.
type vectorStoreState struct {
}

type VectorStoreState struct {
}

func (VectorStoreState) ElementType() reflect.Type {
	return reflect.TypeOf((*vectorStoreState)(nil)).Elem()
}

type vectorStoreArgs struct {
	// Optional OpenAI API key to use for this specific resource.
	ApiKey *string `pulumi:"apiKey"`
	// The chunking strategy used to chunk files.
	ChunkingStrategy map[string]string `pulumi:"chunkingStrategy"`
	// The expiration policy for the vector store.
	ExpiresAfter map[string]string `pulumi:"expiresAfter"`
	// A list of file IDs to be used in the vector store.
	FileIds []string `pulumi:"fileIds"`
	// Set of key-value pairs that can be used to store additional information about the vector store.
	Metadata map[string]string `pulumi:"metadata"`
	// The name of the vector store.
	Name string `pulumi:"name"`
}

// The set of arguments for constructing a VectorStore resource.
type VectorStoreArgs struct {
	// Optional OpenAI API key to use for this specific resource.
	ApiKey pulumi.StringPtrInput
	// The chunking strategy used to chunk files.
	ChunkingStrategy pulumi.StringMapInput
	// The expiration policy for the vector store.
	ExpiresAfter pulumi.StringMapInput
	// A list of file IDs to be used in the vector store.
	FileIds pulumi.StringArrayInput
	// Set of key-value pairs that can be used to store additional information about the vector store.
	Metadata pulumi.StringMapInput
	// The name of the vector store.
	Name pulumi.StringInput
}

func (VectorStoreArgs) ElementType() reflect.Type {
	return reflect.TypeOf((*vectorStoreArgs)(nil)).Elem()
}

type VectorStoreInput interface {
	pulumi.Input

	ToVectorStoreOutput() VectorStoreOutput
	ToVectorStoreOutputWithContext(ctx context.Context) VectorStoreOutput
}

func (*VectorStore) ElementType() reflect.Type {
	return reflect.TypeOf((**VectorStore)(nil)).Elem()
}

func (i *VectorStore) ToVectorStoreOutput() VectorStoreOutput {
	return i.ToVectorStoreOutputWithContext(context.Background())
}

func (i *VectorStore) ToVectorStoreOutputWithContext(ctx context.Context) VectorStoreOutput {
	return pulumi.ToOutputWithContext(ctx, i).(VectorStoreOutput)
}

// VectorStoreArrayInput is an input type that accepts VectorStoreArray and VectorStoreArrayOutput values.
// You can construct a concrete instance of `VectorStoreArrayInput` via:
//
//	VectorStoreArray{ VectorStoreArgs{...} }
type VectorStoreArrayInput interface {
	pulumi.Input

	ToVectorStoreArrayOutput() VectorStoreArrayOutput
	ToVectorStoreArrayOutputWithContext(context.Context) VectorStoreArrayOutput
}

type VectorStoreArray []VectorStoreInput

func (VectorStoreArray) ElementType() reflect.Type {
	return reflect.TypeOf((*[]*VectorStore)(nil)).Elem()
}

func (i VectorStoreArray) ToVectorStoreArrayOutput() VectorStoreArrayOutput {
	return i.ToVectorStoreArrayOutputWithContext(context.Background())
}

func (i VectorStoreArray) ToVectorStoreArrayOutputWithContext(ctx context.Context) VectorStoreArrayOutput {
	return pulumi.ToOutputWithContext(ctx, i).(VectorStoreArrayOutput)
}

// VectorStoreMapInput is an input type that accepts VectorStoreMap and VectorStoreMapOutput values.
// You can construct a concrete instance of `VectorStoreMapInput` via:
//
//	VectorStoreMap{ "key": VectorStoreArgs{...} }
type VectorStoreMapInput interface {
	pulumi.Input

	ToVectorStoreMapOutput() VectorStoreMapOutput
	ToVectorStoreMapOutputWithContext(context.Context) VectorStoreMapOutput
}

type VectorStoreMap map[string]VectorStoreInput

func (VectorStoreMap) ElementType() reflect.Type {
	return reflect.TypeOf((*map[string]*VectorStore)(nil)).Elem()
}

func (i VectorStoreMap) ToVectorStoreMapOutput() VectorStoreMapOutput {
	return i.ToVectorStoreMapOutputWithContext(context.Background())
}

func (i VectorStoreMap) ToVectorStoreMapOutputWithContext(ctx context.Context) VectorStoreMapOutput {
	return pulumi.ToOutputWithContext(ctx, i).(VectorStoreMapOutput)
}

type VectorStoreOutput struct{ *pulumi.OutputState }

func (VectorStoreOutput) ElementType() reflect.Type {
	return reflect.TypeOf((**VectorStore)(nil)).Elem()
}

func (o VectorStoreOutput) ToVectorStoreOutput() VectorStoreOutput {
	return o
}

func (o VectorStoreOutput) ToVectorStoreOutputWithContext(ctx context.Context) VectorStoreOutput {
	return o
}

// Optional OpenAI API key used for this specific resource.
func (o VectorStoreOutput) ApiKey() pulumi.StringPtrOutput {
	return o.ApplyT(func(v *VectorStore) pulumi.StringPtrOutput { return v.ApiKey }).(pulumi.StringPtrOutput)
}

// The Unix timestamp (in seconds) for when the vector store was created.
func (o VectorStoreOutput) CreatedAt() pulumi.Float64Output {
	return o.ApplyT(func(v *VectorStore) pulumi.Float64Output { return v.CreatedAt }).(pulumi.Float64Output)
}

// The expiration policy for the vector store.
func (o VectorStoreOutput) ExpiresAfter() pulumi.StringMapOutput {
	return o.ApplyT(func(v *VectorStore) pulumi.StringMapOutput { return v.ExpiresAfter }).(pulumi.StringMapOutput)
}

// The Unix timestamp (in seconds) for when the vector store will expire.
func (o VectorStoreOutput) ExpiresAt() pulumi.Float64PtrOutput {
	return o.ApplyT(func(v *VectorStore) pulumi.Float64PtrOutput { return v.ExpiresAt }).(pulumi.Float64PtrOutput)
}

// The number of cancelled files in this vector store.
func (o VectorStoreOutput) FileCountCancelled() pulumi.Float64PtrOutput {
	return o.ApplyT(func(v *VectorStore) pulumi.Float64PtrOutput { return v.FileCountCancelled }).(pulumi.Float64PtrOutput)
}

// Counts of files in the vector store by status.
func (o VectorStoreOutput) FileCounts() pulumi.StringMapOutput {
	return o.ApplyT(func(v *VectorStore) pulumi.StringMapOutput { return v.FileCounts }).(pulumi.StringMapOutput)
}

// A list of file IDs used in the vector store.
func (o VectorStoreOutput) FileIds() pulumi.StringArrayOutput {
	return o.ApplyT(func(v *VectorStore) pulumi.StringArrayOutput { return v.FileIds }).(pulumi.StringArrayOutput)
}

// The unique identifier for the vector store.
func (o VectorStoreOutput) Id() pulumi.StringOutput {
	return o.ApplyT(func(v *VectorStore) pulumi.StringOutput { return v.Id }).(pulumi.StringOutput)
}

// The Unix timestamp (in seconds) for when the vector store was last active.
func (o VectorStoreOutput) LastActiveAt() pulumi.Float64PtrOutput {
	return o.ApplyT(func(v *VectorStore) pulumi.Float64PtrOutput { return v.LastActiveAt }).(pulumi.Float64PtrOutput)
}

// Set of key-value pairs that can be used to store additional information about the vector store.
func (o VectorStoreOutput) Metadata() pulumi.StringMapOutput {
	return o.ApplyT(func(v *VectorStore) pulumi.StringMapOutput { return v.Metadata }).(pulumi.StringMapOutput)
}

// The name of the vector store.
func (o VectorStoreOutput) Name() pulumi.StringOutput {
	return o.ApplyT(func(v *VectorStore) pulumi.StringOutput { return v.Name }).(pulumi.StringOutput)
}

// The object type, which is always 'vector_store'.
func (o VectorStoreOutput) Object() pulumi.StringOutput {
	return o.ApplyT(func(v *VectorStore) pulumi.StringOutput { return v.Object }).(pulumi.StringOutput)
}

// The status of the vector store (e.g., 'completed', 'in_progress').
func (o VectorStoreOutput) Status() pulumi.StringOutput {
	return o.ApplyT(func(v *VectorStore) pulumi.StringOutput { return v.Status }).(pulumi.StringOutput)
}

// The number of bytes used by the vector store.
func (o VectorStoreOutput) UsageBytes() pulumi.Float64PtrOutput {
	return o.ApplyT(func(v *VectorStore) pulumi.Float64PtrOutput { return v.UsageBytes }).(pulumi.Float64PtrOutput)
}

type VectorStoreArrayOutput struct{ *pulumi.OutputState }

func (VectorStoreArrayOutput) ElementType() reflect.Type {
	return reflect.TypeOf((*[]*VectorStore)(nil)).Elem()
}

func (o VectorStoreArrayOutput) ToVectorStoreArrayOutput() VectorStoreArrayOutput {
	return o
}

func (o VectorStoreArrayOutput) ToVectorStoreArrayOutputWithContext(ctx context.Context) VectorStoreArrayOutput {
	return o
}

func (o VectorStoreArrayOutput) Index(i pulumi.IntInput) VectorStoreOutput {
	return pulumi.All(o, i).ApplyT(func(vs []interface{}) *VectorStore {
		return vs[0].([]*VectorStore)[vs[1].(int)]
	}).(VectorStoreOutput)
}

type VectorStoreMapOutput struct{ *pulumi.OutputState }

func (VectorStoreMapOutput) ElementType() reflect.Type {
	return reflect.TypeOf((*map[string]*VectorStore)(nil)).Elem()
}

func (o VectorStoreMapOutput) ToVectorStoreMapOutput() VectorStoreMapOutput {
	return o
}

func (o VectorStoreMapOutput) ToVectorStoreMapOutputWithContext(ctx context.Context) VectorStoreMapOutput {
	return o
}

func (o VectorStoreMapOutput) MapIndex(k pulumi.StringInput) VectorStoreOutput {
	return pulumi.All(o, k).ApplyT(func(vs []interface{}) *VectorStore {
		return vs[0].(map[string]*VectorStore)[vs[1].(string)]
	}).(VectorStoreOutput)
}

func init() {
	pulumi.RegisterInputType(reflect.TypeOf((*VectorStoreInput)(nil)).Elem(), &VectorStore{})
	pulumi.RegisterInputType(reflect.TypeOf((*VectorStoreArrayInput)(nil)).Elem(), VectorStoreArray{})
	pulumi.RegisterInputType(reflect.TypeOf((*VectorStoreMapInput)(nil)).Elem(), VectorStoreMap{})
	pulumi.RegisterOutputType(VectorStoreOutput{})
	pulumi.RegisterOutputType(VectorStoreArrayOutput{})
	pulumi.RegisterOutputType(VectorStoreMapOutput{})
}
