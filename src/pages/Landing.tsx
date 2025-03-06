import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Heart, Users, Star, Menu, X } from "lucide-react";

const Landing = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 py-4 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <MapPin className="h-6 w-6 text-pink-500" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                FamilyApp
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#reviews"
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Reviews
            </a>
            <a
              href="#about"
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              About Us
            </a>
            {user ? (
              <Link to="/dashboard">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full px-6">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    Log in
                  </Button>
                </Link>
                <Link to="/login?signup=true">
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full px-6">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4 px-4">
              <a
                href="#features"
                className="text-gray-600 hover:text-purple-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#reviews"
                className="text-gray-600 hover:text-purple-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Reviews
              </a>
              <a
                href="#about"
                className="text-gray-600 hover:text-purple-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </a>
              {user ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link
                    to="/login?signup=true"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-purple-50 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
                Family-friendly location finder
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="block">The best place to</span>
                <span className="text-purple-600">discover</span> and{" "}
                <span className="text-yellow-500 relative">
                  explore
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 138 9"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 7C34.6667 3 85.3333 1.66667 136 5"
                      stroke="#FFC107"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Discover parks, playgrounds, kid-friendly restaurants, and more
                - all curated for families like yours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={user ? "/dashboard" : "/login"}>
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full px-8 py-3 text-lg">
                    Get started
                  </Button>
                </Link>
                <a href="#features">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-purple-200 text-purple-700 hover:bg-purple-50 rounded-full px-8 py-3 text-lg"
                  >
                    Learn more
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-yellow-200 rounded-full opacity-50"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-200 rounded-full opacity-50"></div>
              <img
                src="https://images.unsplash.com/photo-1597116635010-8b65f0dce76c?w=800&q=80"
                alt="Family enjoying a park"
                className="relative z-10 rounded-2xl shadow-xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-4 w-12 h-12 bg-pink-200 rounded-full opacity-30"></div>
        <div className="absolute bottom-1/3 right-8 w-20 h-20 bg-purple-200 rounded-full opacity-30"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our interactive features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to find perfect family-friendly spots in your
              area
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-purple-50 rounded-2xl p-8 transition-transform hover:scale-105">
              <div className="w-14 h-14 bg-purple-200 rounded-full flex items-center justify-center mb-6">
                <MapPin className="h-7 w-7 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold mb-3">Interactive Map</h3>
              <p className="text-gray-600">
                Explore an interactive map showing all family-friendly locations
                near you, with detailed information about each place.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-pink-50 rounded-2xl p-8 transition-transform hover:scale-105">
              <div className="w-14 h-14 bg-pink-200 rounded-full flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-pink-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Filters</h3>
              <p className="text-gray-600">
                Filter locations by category, distance, and age appropriateness
                to find exactly what you're looking for.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-yellow-50 rounded-2xl p-8 transition-transform hover:scale-105">
              <div className="w-14 h-14 bg-yellow-200 rounded-full flex items-center justify-center mb-6">
                <Heart className="h-7 w-7 text-yellow-700" />
              </div>
              <h3 className="text-xl font-bold mb-3">Save Favorites</h3>
              <p className="text-gray-600">
                Bookmark your favorite locations for quick access later, and
                share them with family and friends.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-blue-50 rounded-2xl p-8 transition-transform hover:scale-105">
              <div className="w-14 h-14 bg-blue-200 rounded-full flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-blue-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Updates</h3>
              <p className="text-gray-600">
                Get real-time information about opening hours, current capacity,
                and special events at family-friendly locations.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-green-50 rounded-2xl p-8 transition-transform hover:scale-105">
              <div className="w-14 h-14 bg-green-200 rounded-full flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-green-700" />
              </div>
              <h3 className="text-xl font-bold mb-3">Community Reviews</h3>
              <p className="text-gray-600">
                Read honest reviews from other parents and contribute your own
                experiences to help the community.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-indigo-50 rounded-2xl p-8 transition-transform hover:scale-105">
              <div className="w-14 h-14 bg-indigo-200 rounded-full flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-indigo-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Safety Information</h3>
              <p className="text-gray-600">
                Access important safety details about each location, including
                cleanliness ratings and security features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-purple-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by families everywhere
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See what parents are saying about their experience with FamilyApp
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center mb-6">
                <img
                  className="h-12 w-12 rounded-full"
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"
                  alt="User avatar"
                />
                <div className="ml-4">
                  <h4 className="text-lg font-bold">Emily R.</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "This app has been a lifesaver for our family weekends! We've
                discovered so many amazing playgrounds and kid-friendly
                restaurants we never knew existed."
              </p>
            </div>

            {/* Review 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center mb-6">
                <img
                  className="h-12 w-12 rounded-full"
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
                  alt="User avatar"
                />
                <div className="ml-4">
                  <h4 className="text-lg font-bold">Michael T.</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The filter system is fantastic! Being able to find places
                suitable for my toddler and older child at the same time has
                made family outings so much easier."
              </p>
            </div>

            {/* Review 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center mb-6">
                <img
                  className="h-12 w-12 rounded-full"
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia"
                  alt="User avatar"
                />
                <div className="ml-4">
                  <h4 className="text-lg font-bold">Sophia L.</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "I love the bookmark feature! I can save all our favorite spots
                and quickly find them when planning our weekend activities. This
                app has become essential for our family."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                About FamilyApp
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We created FamilyApp with a simple mission: to help parents find
                the best places for their children to play, learn, and grow. As
                parents ourselves, we understand the challenges of finding
                family-friendly locations that are safe, fun, and enriching.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our team of dedicated parents and technology experts work
                together to provide you with the most comprehensive and
                up-to-date information about family-friendly places in your
                area.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <img
                    className="h-10 w-10 rounded-full border-2 border-white"
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                    alt="Team member"
                  />
                  <img
                    className="h-10 w-10 rounded-full border-2 border-white"
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie"
                    alt="Team member"
                  />
                  <img
                    className="h-10 w-10 rounded-full border-2 border-white"
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor"
                    alt="Team member"
                  />
                </div>
                <span className="text-sm text-gray-500">Our founding team</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-pink-200 rounded-full opacity-50"></div>
              <img
                src="https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=800&q=80"
                alt="Family having fun"
                className="relative z-10 rounded-2xl shadow-xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to explore?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start discovering family-friendly places today.
          </p>
          <Link to={user ? "/dashboard" : "/login"}>
            <Button className="bg-white text-purple-700 hover:bg-gray-100 rounded-full px-8 py-3 text-lg font-medium">
              Get started
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 text-pink-400" />
                <span className="ml-2 text-xl font-bold text-white">
                  FamilyApp
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                Find family-friendly places near you
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Interactive Map
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Smart Filters
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Bookmarks
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Real-time Updates
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#about"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">Email: hello@familyapp.com</li>
                <li className="text-gray-400">Phone: (123) 456-7890</li>
                <li className="text-gray-400">
                  Address: 123 Family St, New York, NY
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FamilyApp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
