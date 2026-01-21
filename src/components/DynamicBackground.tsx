const DynamicBackground = () => {
  // Simplified to a static subtle gradient - no animations
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-b from-background to-secondary/20"
      aria-hidden="true"
    />
  );
};

export default DynamicBackground;
