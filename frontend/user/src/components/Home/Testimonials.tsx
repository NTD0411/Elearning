"use client";
import Image from "next/image";
import { useState } from "react";
import { Icon } from "@iconify/react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  image: string;
}

const testimonialData: Testimonial[] = [
  {
    id: 1,
    name: "Musharof Chowdhury",
    role: "IELTS Trainer",
    content:
      "Our members are so impressed. It's intuitive. It's clean. It's distraction free. If you're building a community.",
    image: "/images/testimonials/author-01.png"
  },
  {
    id: 2,
    name: "Devid Wilium",
    role: "English Teacher",
    content:
      "Our members are so impressed. It's intuitive. It's clean. It's distraction free. If you're building a community.",
    image: "/images/testimonials/author-02.png"
  },
  {
    id: 3,
    name: "Sarah Jane",
    role: "IELTS Student",
    content:
      "Our members are so impressed. It's intuitive. It's clean. It's distraction free. If you're building a community.",
    image: "/images/testimonials/author-03.png"
  }
];

const Testimonial = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonialData.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonialData.length) % testimonialData.length);
  };

  return (
    <section id="testimonial" className="relative z-10 pt-[120px] pb-[120px]">
      <div className="container">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full px-4">
            <div className="mx-auto mb-[100px] max-w-[510px] text-center">
              <span className="mb-2 block text-lg font-semibold text-primary">
                Testimonials
              </span>
              <h2 className="mb-3 text-3xl font-bold text-dark sm:text-4xl md:text-[40px] md:leading-[1.2]">
                Student Success Stories
              </h2>
              <p className="text-base text-body-color">
                Hear from our students who have achieved their IELTS goals with us.
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex justify-center">
          <div className="relative w-full max-w-[570px] rounded-[20px] bg-white py-12 px-8 shadow-lg md:px-[60px]">
            <div className="mx-auto max-w-[472px]">
              <p className="mb-[30px] text-base text-body-color">
                {testimonialData[currentTestimonial].content}
              </p>
              <div className="flex items-center">
                <div className="relative mr-4 h-[50px] w-[50px] overflow-hidden rounded-full">
                  <Image
                    src={testimonialData[currentTestimonial].image}
                    alt={testimonialData[currentTestimonial].name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-dark">
                    {testimonialData[currentTestimonial].name}
                  </h3>
                  <p className="text-sm text-body-color">
                    {testimonialData[currentTestimonial].role}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute right-0 top-1/2 flex -translate-y-1/2 transform space-x-3">
              <button
                onClick={prevTestimonial}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark"
              >
                <Icon icon="heroicons:chevron-left-20-solid" className="h-6 w-6" />
              </button>
              <button
                onClick={nextTestimonial}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark"
              >
                <Icon icon="heroicons:chevron-right-20-solid" className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;