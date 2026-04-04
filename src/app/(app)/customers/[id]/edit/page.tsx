import { notFound } from "next/navigation";
import { CustomerForm } from "@/src/components/customer/CustomerForm";
import { getCustomerById } from "@/src/lib/mockData";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCustomerPage({ params }: PageProps) {
  const { id } = await params;
  const customer = getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <CustomerForm
      mode="edit"
      customerId={id}
      initialData={{
        name: customer.name,
        company_name: customer.company_name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
      }}
    />
  );
}
