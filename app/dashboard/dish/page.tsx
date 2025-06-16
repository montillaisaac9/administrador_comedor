'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, User, StarHalf, StarOff } from 'lucide-react';
import * as dishService from '@/app/service/dish.service';
import type { DishDto } from '@/app/types/dish';
import type { Rating, Comment } from '@/app/types/feedback';


const DishDetailPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dish, setDish] = useState<DishDto | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [ratingStats, setRatingStats] = useState<{ totalVotes: number; averageRating: number } | null>(null);
  
  const dishId = searchParams.get('id');
  // Menu item ID is available if needed in the future
  // const menuItemId = searchParams.get('menuItemId');

  useEffect(() => {
    const fetchDishData = async () => {
      if (!dishId) return;
      
      try {
        setLoading(true);
        
        // Fetch dish details
        const dishResponse = await dishService.getDishById(Number(dishId));
        if (dishResponse.success && dishResponse.data) {
          setDish(dishResponse.data);
        }
        
        // Fetch ratings
        const ratingsResponse = await dishService.getRating(Number(dishId), { limit: 10 });
        if (ratingsResponse.success && ratingsResponse.data) {
          setRatings(ratingsResponse.data.arrayList);
        }
        
        // Fetch comments
        const commentsResponse = await dishService.getComments(Number(dishId), { limit: 10 });
        if (commentsResponse.success && commentsResponse.data) {
          setComments(commentsResponse.data.arrayList);
        }
        
        // Fetch rating statistics
        const statsResponse = await dishService.getTottalRating(Number(dishId));
        if (statsResponse.success && statsResponse.data) {
          setRatingStats(statsResponse.data);
        }
        
      } catch (err) {
        console.error('Error fetching dish data:', err);
        setError('Error al cargar la información del plato');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDishData();
  }, [dishId]);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} className="w-5 h-5 text-yellow-400 fill-current" />);
      } else {
        stars.push(<StarOff key={i} className="w-5 h-5 text-gray-300" />);
      }
    }
    
    return stars;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">No se encontró el plato solicitado.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Volver atrás
      </button>
      
      {/* Dish Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:flex-shrink-0 md:w-1/3">
            {dish.photo ? (
              <Image 
                className="h-64 w-full object-cover md:h-full" 
                src={dish.photo} 
                alt={dish.title}
                width={400}
                height={400}
                priority
              />
            ) : (
              <div className="h-64 w-full bg-gray-200 flex items-center justify-center text-gray-400">
                <span>Sin imagen</span>
              </div>
            )}
          </div>
          
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-600 font-semibold">
              Plato del día
            </div>
            <h1 className="block mt-1 text-2xl font-medium text-gray-900">
              {dish.title}
            </h1>
            
            <div className="mt-4">
              <p className="text-gray-600">{dish.description}</p>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">Información Nutricional</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Calorías: </span>
                    <span className="font-medium">{dish.calories} kcal</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Proteínas: </span>
                    <span className="font-medium">{dish.proteins}g</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Grasas: </span>
                    <span className="font-medium">{dish.fats}g</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Carbohidratos: </span>
                    <span className="font-medium">{dish.carbohydrates}g</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="ml-1 text-gray-700">
                      {ratingStats?.averageRating?.toFixed(1) || 'N/A'}
                    </span>
                    <span className="mx-1 text-gray-400">•</span>
                    <span className="text-gray-500">
                      {ratingStats?.totalVotes || 0} {ratingStats?.totalVotes === 1 ? 'valoración' : 'valoraciones'}
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ${dish.cost.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ratings & Comments Section */}
      <div className="mt-12">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Valoraciones y Comentarios</h2>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center">
              {ratingStats && renderStars(ratingStats.averageRating)}
              <span className="ml-2 text-gray-700">
                {ratingStats?.averageRating?.toFixed(1)} de 5
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Basado en {ratingStats?.totalVotes || 0} {ratingStats?.totalVotes === 1 ? 'valoración' : 'valoraciones'}
            </p>
          </div>
        </div>
        
        {/* Ratings List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Valoraciones recientes
            </h3>
          </div>
          <div className="border-t border-gray-200">
            {ratings.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {ratings.map((rating) => (
                  <li key={rating.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <User className="h-10 w-10 rounded-full bg-gray-200 p-2 text-gray-500" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {rating.user?.name || 'Usuario anónimo'}
                            </p>
                            <div className="flex items-center mt-1">
                              {renderStars(rating.rating)}
                              <span className="ml-2 text-sm text-gray-500">
                                {formatDate(rating.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {rating.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 sm:px-6">
                <p className="text-gray-500 italic">No hay valoraciones para este plato aún.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Comments List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Comentarios recientes
            </h3>
          </div>
          <div className="border-t border-gray-200">
            {comments.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {comments.map((comment) => (
                  <li key={comment.id} className="px-4 py-4 sm:px-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <User className="h-10 w-10 rounded-full bg-gray-200 p-2 text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {comment.user?.name || 'Usuario anónimo'}
                          </p>
                          <span className="ml-2 text-sm text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-700">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 sm:px-6">
                <p className="text-gray-500 italic">No hay comentarios para este plato aún.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishDetailPage;