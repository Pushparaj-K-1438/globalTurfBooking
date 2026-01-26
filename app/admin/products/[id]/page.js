import ProductForm from "../../../../components/admin/ProductForm";

export default async function EditProductPage(props) {
    const params = await props.params;
    return (
        <div className="min-h-screen bg-slate-50">
            <ProductForm productId={params.id} />
        </div>
    );
}
