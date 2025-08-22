'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function StepItem({ step, title, desc, imageSrc }) {
  const [showImage, setShowImage] = useState(false)

  return (
    <>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-32 cursor-pointer" onClick={() => setShowImage(true)}>
          <Image src={imageSrc} alt={title} width={128} height={128} className="rounded shadow" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-semibold">Step {step}</p>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-gray-700">{desc}</p>
        </div>
      </div>

      {showImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowImage(false)}
        >
          <Image
            src={imageSrc}
            alt={title}
            width={800}
            height={800}
            className="rounded shadow-lg"
          />
        </div>
      )}
    </>
  )
}
