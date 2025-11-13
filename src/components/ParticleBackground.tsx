export const ParticleBackground = () => {
  // Generate random particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 8 + 4, // 4-12px
    left: Math.random() * 100, // 0-100%
    top: Math.random() * 100, // 0-100%
    delay: Math.random() * 5, // 0-5s
    duration: Math.random() * 10 + 15, // 15-25s
    color: i % 2 === 0 ? 'primary' : 'accent',
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full blur-sm ${
            particle.color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'
          } animate-float`}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
      
      {/* Larger glowing orbs */}
      <div 
        className="absolute w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"
        style={{ top: '10%', left: '80%', animationDuration: '20s' }}
      />
      <div 
        className="absolute w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float"
        style={{ top: '60%', left: '10%', animationDuration: '25s', animationDelay: '5s' }}
      />
      <div 
        className="absolute w-64 h-64 bg-primary-glow/5 rounded-full blur-3xl animate-float"
        style={{ top: '40%', right: '15%', animationDuration: '30s', animationDelay: '10s' }}
      />
    </div>
  );
};
