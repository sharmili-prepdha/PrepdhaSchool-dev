interface Props {
  message?: string;
}

export default function ErrorMessage({ message }: Props) {
  if (!message) return null;

  return <p className="text-red-500 text-sm text-center mt-2">{message}</p>;
}
