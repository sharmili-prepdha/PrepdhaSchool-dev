import Link from "next/link";

export default function PrincipalPage() {
  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Principal Dashboard</h1>
        <Link href="/logout" className="text-blue-600 underline mt-4 block">
          Logout
        </Link>
      </div>
    </>
  );
}
