export default function StepItem({ step, title, desc, imageSrc }) {
  return (
    <div className="mb-8 p-6 bg-white shadow rounded-xl text-center">
      <h3 className="text-xl font-semibold mb-3">
        Langkah {step}: {title}
      </h3>
      <p className="text-gray-600 mb-4">{desc}</p>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={title}
          className="rounded-lg border shadow-sm w-full max-w-md mx-auto"
        />
      )}
    </div>
  )
}
