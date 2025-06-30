import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-gray/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={40} 
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Comedor Universitario
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/auth/login" 
                className="px-4 py-2 text-gray-700 hover:text-blue-700 dark:text-gray-200 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/auth/register" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-md hover:shadow-lg"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16 md:py-32">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6">
              Bienvenido al Sistema de Gestión del Comedor Universitario
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Administra y optimiza el servicio de comedor de tu universidad de manera eficiente y sencilla.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/auth/login" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-center transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/auth/register" 
                className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-8 rounded-lg border border-blue-600 text-center transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-blue-400 dark:hover:bg-gray-700"
              >
                Crear Cuenta
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md h-80 md:h-96">
              <Image
                src="/comedor.jpg"
                alt="Comedor Universitario"
                fill
                className="object-cover rounded-xl shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
            Características Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Gestión de Menús",
                description: "Crea y administra los menús diarios de manera sencilla y rápida.",
                icon: "🍽️"
              },
              {
                title: "Control de Asistencia",
                description: "Registra y monitorea la asistencia de los estudiantes al comedor.",
                icon: "📋"
              },
              {
                title: "Reportes en Tiempo Real",
                description: "Genera reportes detallados del uso del servicio de comedor.",
                icon: "📊"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Comedor Universitario - Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}
