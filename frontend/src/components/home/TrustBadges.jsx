import React from 'react';
import { Gem, Hand, Users, Package } from 'lucide-react';
import { trustBadges } from '../../data/mock';

const iconMap = {
  gem: Gem,
  hand: Hand,
  users: Users,
  package: Package
};

const TrustBadges = () => {
  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl lg:text-3xl font-serif text-gray-900 text-center mb-10">
          India's #1 personalized jewellery brand for a reason.
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {trustBadges.map((badge) => {
            const IconComponent = iconMap[badge.icon] || Gem;
            return (
              <div key={badge.id} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <IconComponent className="w-7 h-7 text-gray-700" />
                </div>
                <h3 className="font-medium text-gray-900">{badge.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;