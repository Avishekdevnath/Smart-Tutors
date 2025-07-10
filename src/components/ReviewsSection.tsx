'use client';

const reviews = [
  {
    name: 'Ayesha Rahman',
    role: 'Guardian',
    text: 'Smart Tutors made it so easy to find a qualified tutor for my daughter. The process was smooth and the support team was very responsive!',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    rating: 5,
  },
  {
    name: 'Md. Imran Hossain',
    role: 'Tutor',
    text: 'I love how organized the platform is. I can manage my applications and communicate with guardians easily. Highly recommended for tutors!',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
  },
  {
    name: 'Shamima Akter',
    role: 'Guardian',
    text: 'The matching system is fantastic. We found a great tutor for our son within days. Thank you Smart Tutors!',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 4,
  },
  {
    name: 'Tanvir Ahmed',
    role: 'Tutor',
    text: 'The dashboard and analytics help me track my progress and improve my teaching. The support is top-notch.',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    rating: 5,
  },
];

export default function ReviewsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real feedback from guardians and tutors who use Smart Tutors every day.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300">
              <img
                src={review.avatar}
                alt={review.name}
                className="w-20 h-20 rounded-full mb-4 object-cover border-4 border-blue-100 shadow"
              />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{review.name}</h3>
              <span className="text-sm text-blue-600 font-medium mb-2">{review.role}</span>
              <div className="flex items-center justify-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 text-base mb-4">"{review.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 