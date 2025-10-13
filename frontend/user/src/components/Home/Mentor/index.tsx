"use client"
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getImagePrefix } from "@/utils/util";
import Link from "next/link";

interface Mentor {
  userId: number;
  fullName: string;
  email: string;
  portraitUrl?: string;
  experience?: string;
  status?: string;
}

const Mentor = () => {
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const response = await fetch('http://localhost:5074/api/User/mentors');
                if (response.ok) {
                    const data = await response.json();
                    setMentors(data);
                }
            } catch (error) {
                console.error('Error fetching mentors:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMentors();
    }, []);

    const settings = {
        dots: false,
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true,
        cssEase: "linear",
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 1000,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 530,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

    return (
        <section className="bg-deepSlate" id="mentor" >
            <div className='container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4 relative'>
                <h2 className="text-midnight_text text-5xl font-semibold">Meet with our <br /> mentor.</h2>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading mentors...</p>
                    </div>
                ) : mentors.length > 0 ? (
                    <Slider {...settings}>
                        {mentors.map((mentor) => (
                            <div key={mentor.userId}>
                                <div className='m-3 py-14 md:my-10 text-center'>
                                    <Link href={`/mentor/${mentor.userId}`}>
                                        <div className="relative cursor-pointer">
                                            <div className="inline-flex m-auto w-[200px] h-[200px] md:w-[240px] md:h-[240px] rounded-full overflow-hidden items-center justify-center">
                                                <Image 
                                                    src={mentor.portraitUrl || `${getImagePrefix()}images/mentor/user1.png`} 
                                                    alt="mentor-image" 
                                                    width={240} 
                                                    height={240} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            </div>
                                            <div className="absolute right-[84px] bottom-[102px] bg-white rounded-full p-4">
                                                <Image src={`${getImagePrefix()}images/mentor/linkedin.svg`} alt="linkedin-image" width={25} height={24} />
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="mt-4">
                                        <h3 className='text-2xl font-semibold text-lightblack'>{mentor.fullName}</h3>
                                        <h4 className='text-lg font-normal text-lightblack pt-2 opacity-50'>Mentor</h4>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-600">No mentors available at the moment.</p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Mentor