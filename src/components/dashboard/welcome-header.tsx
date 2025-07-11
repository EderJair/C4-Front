interface WelcomeHeaderProps {
  firstName: string;
  description: string;
}

export default function WelcomeHeader({ firstName, description }: WelcomeHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">
        ¡Hola, Ing. {firstName}!
      </h1>
      <p className="text-gray-600 mt-2">
        {description}
      </p>
    </div>
  );
}
