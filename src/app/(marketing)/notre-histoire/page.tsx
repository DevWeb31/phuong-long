/**
 * Notre Histoire Page
 * 
 * Page racontant l'histoire du Phuong Long Vo Dao et de la création de l'association
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import type { Metadata } from 'next';
import { Container, ScrollReveal, Card, CardContent } from '@/components/common';
import { GradientButton } from '@/components/marketing/GradientButton';
import { History, Users, Award, MapPin, Sparkles, Target, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Notre Histoire - Phuong Long Vo Dao',
  description: 'Découvrez l\'histoire du Phuong Long Vo Dao, art martial vietnamien traditionnel, et la création de notre association en France.',
};

interface TimelineItem {
  year: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'primary' | 'secondary' | 'accent';
}

const timeline: TimelineItem[] = [
  {
    year: '1916',
    title: 'Naissance de Maître Nguyễn Dân Phú',
    description: 'Nguyễn Dân Phú naît le 12 novembre 1916 dans le protectorat français du Tonkin. Il deviendra l\'un des maîtres les plus influents ayant permis l\'essor du Viet Vo Dao en France.',
    icon: History,
    color: 'primary',
  },
  {
    year: '1973',
    title: 'Cofondation de la Fédération Française',
    description: 'Maître Nguyễn Dân Phú est l\'un des cofondateurs de la première fédération française de Viet Vo Dao. Cette étape marque la structuration officielle des arts martiaux vietnamiens en France.',
    icon: Users,
    color: 'secondary',
  },
  {
    year: '1973-1991',
    title: 'L\'École Thanh Long Vo Duong',
    description: 'Maître Nguyễn Dân Phú crée et conduit l\'école Thanh Long Vo Duong à son apogée jusqu\'en 1991. Cette période voit l\'enseignement et la diffusion du Viet Vo Dao se développer considérablement en France.',
    icon: Award,
    color: 'accent',
  },
  {
    year: '1991',
    title: 'Patriarche du Viet Vo Dao',
    description: 'Maître Nguyễn Dân Phú est nommé 10e dang, Patriarche du Viet Vo Dao en France et doyen du Viet Vo Dao pour l\'Europe. Il devient la référence incontestée des arts martiaux vietnamiens en Europe.',
    icon: Award,
    color: 'primary',
  },
  {
    year: '1999',
    title: 'Décès et Héritage',
    description: 'Maître Nguyễn Dân Phú décède le 28 juin 1999 à Désertines. Son héritage perdure à travers ses élèves et l\'association Phuong Long Vo Dao qui continue de transmettre son enseignement.',
    icon: History,
    color: 'secondary',
  },
  {
    year: '2015',
    title: 'Reconnaissance Posthume',
    description: 'Maître Nguyễn Dân Phú reçoit le grade officiel de 9e Dan à titre posthume, attribué par la FFKDA en mars 2015. Cette reconnaissance honore son immense contribution aux arts martiaux vietnamiens en France.',
    icon: Sparkles,
    color: 'accent',
  },
  {
    year: '2025',
    title: 'Aujourd\'hui',
    description: 'Avec 5 clubs actifs, plus de 500 pratiquants et plusieurs décennies d\'expérience, l\'association Phuong Long Vo Dao perpétue l\'enseignement de Maître Nguyễn Dân Phú et continue de transmettre les valeurs et techniques du Viet Vo Dao aux nouvelles générations.',
    icon: Sparkles,
    color: 'primary',
  },
];

const values = [
  {
    icon: Target,
    title: 'Excellence',
    description: 'Nous visons l\'excellence dans la pratique et l\'enseignement des arts martiaux vietnamiens.',
    color: 'primary',
  },
  {
    icon: Shield,
    title: 'Tradition',
    description: 'Nous préservons et transmettons les techniques et valeurs traditionnelles du Vo Dao.',
    color: 'secondary',
  },
  {
    icon: Users,
    title: 'Communauté',
    description: 'Nous construisons une communauté soudée autour de valeurs communes et du partage.',
    color: 'accent',
  },
];

export default function NotreHistoirePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-[#E6110A] py-12 lg:py-16 overflow-hidden">
        {/* Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <Container className="relative z-10">
          <ScrollReveal direction="down" delay={0}>
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-full mb-8">
                <History className="w-5 h-5" />
                <span className="font-semibold text-sm tracking-wide">Notre Histoire</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-[1.1]">
                L'Histoire du <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-400 to-accent">Phuong Long Vo Dao</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/95 mb-4 font-medium max-w-3xl mx-auto leading-relaxed">
                Découvrez l'héritage d'un art martial traditionnel vietnamien et l'aventure de notre association en France
              </p>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* Introduction Section */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-900">
        <Container>
          <ScrollReveal direction="up" delay={0}>
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                Une Tradition Millénaire
              </h2>
              <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                Le Phuong Long Vo Dao est bien plus qu'un simple art martial. C'est un héritage culturel vietnamien 
                qui allie techniques de combat ancestrales, philosophie orientale et valeurs humaines. 
                Notre association perpétue l'enseignement de Maître Nguyễn Dân Phú, l'un des maîtres fondateurs 
                du Viet Vo Dao en France, nommé 10e dang et Patriarche du Viet Vo Dao en France. 
                Nous transmettons ce savoir précieux aux générations présentes et futures.
              </p>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* Timeline Section */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-3xl" />
        
        <Container className="relative z-10">
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-5">
                Notre Parcours
              </h2>
              <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Les grandes étapes qui ont marqué l'histoire de notre association
              </p>
            </div>
          </ScrollReveal>

          <div className="max-w-5xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-secondary to-accent hidden lg:block" 
              style={{ height: 'calc(100% - 4rem)' }} 
            />

            <div className="space-y-16 lg:space-y-24">
              {timeline.map((item, index) => {
                const Icon = item.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <ScrollReveal key={item.year} direction={isEven ? 'left' : 'right'} delay={index * 100}>
                    <div className={`relative flex flex-col lg:flex-row items-center gap-8 ${isEven ? 'lg:flex-row-reverse' : ''}`}>
                      {/* Year Badge */}
                      <div className="relative z-10 flex-shrink-0">
                        <div className={`rounded-full flex items-center justify-center font-bold text-white shadow-xl ${
                          item.year.includes('-') 
                            ? 'w-28 h-28 text-lg leading-tight px-2' 
                            : 'w-24 h-24 text-2xl'
                        } ${
                          item.color === 'primary' ? 'bg-gradient-to-br from-primary to-primary-dark' :
                          item.color === 'secondary' ? 'bg-gradient-to-br from-secondary to-secondary-dark' :
                          'bg-gradient-to-br from-accent to-amber-600'
                        }`}>
                          {item.year.includes('-') ? (
                            <div className="text-center">
                              <div>{item.year.split('-')[0]}</div>
                              <div className="text-sm">-</div>
                              <div>{item.year.split('-')[1]}</div>
                            </div>
                          ) : (
                            item.year
                          )}
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className={`flex-1 ${isEven ? 'lg:text-right' : 'lg:text-left'}`}>
                        <Card hoverable className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                          <CardContent className="p-8">
                            <div className={`flex items-center gap-3 mb-4 ${isEven ? 'lg:justify-end' : 'lg:justify-start'}`}>
                              <div className={`p-3 rounded-xl ${
                                item.color === 'primary' ? 'bg-primary/10 text-primary' :
                                item.color === 'secondary' ? 'bg-secondary/10 text-secondary' :
                                'bg-accent/10 text-accent'
                              }`}>
                                <Icon className="w-6 h-6" />
                              </div>
                              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {item.title}
                              </h3>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                              {item.description}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-900">
        <Container>
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-5">
                Nos Valeurs Fondamentales
              </h2>
              <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Les principes qui guident notre pratique et notre enseignement
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <ScrollReveal key={value.title} direction="up" delay={index * 100}>
                  <Card hoverable className="text-center bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <CardContent className="pt-10 pb-10 px-8 flex-1 flex flex-col">
                      <div className="relative w-20 h-20 mx-auto mb-8">
                        <div className={`absolute inset-0 rounded-2xl opacity-10 transition-opacity ${
                          value.color === 'primary' ? 'bg-gradient-to-br from-primary to-primary-dark' :
                          value.color === 'secondary' ? 'bg-gradient-to-br from-secondary to-secondary-dark' :
                          'bg-gradient-to-br from-accent to-amber-600'
                        }`} />
                        <div className={`relative w-full h-full rounded-2xl flex items-center justify-center transition-transform duration-300 shadow-lg ${
                          value.color === 'primary' ? 'bg-gradient-to-br from-primary to-primary-dark' :
                          value.color === 'secondary' ? 'bg-gradient-to-br from-secondary to-secondary-dark' :
                          'bg-gradient-to-br from-accent to-amber-600'
                        }`}>
                          <Icon className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                        {value.title}
                      </h3>
                      <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 flex-1">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        {/* Background moderne */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary-dark to-slate-900" />
        
        {/* Effets lumineux subtils */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.15),transparent_50%)]" />
        
        <Container className="relative z-10">
          <ScrollReveal direction="up" delay={0}>
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
                Rejoignez Notre Histoire
              </h2>
              <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                Devenez partie intégrante de cette tradition vivante. 
                Découvrez le Phuong Long Vo Dao dans l'un de nos 5 clubs en France.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <GradientButton href="/clubs">
                  Trouver un Club
                  <MapPin className="w-5 h-5" />
                </GradientButton>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </>
  );
}

