export default function SceneBackdrop({ subtle = false }) {
  return (
    <div className={`scene-backdrop ${subtle ? "scene-subtle" : ""}`} aria-hidden="true">
      <div className="star-layer star-layer-one" />
      <div className="star-layer star-layer-two" />
      <div className="star-layer star-layer-three" />
      <div className="sky-grid" />
    </div>
  );
}
