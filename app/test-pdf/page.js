export default function TestPDF() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Tes Preview PDF</h1>
      <iframe
        src="/modul/modul1.pdf"
        width="100%"
        height="600"
        className="border"
        title="Preview PDF"
      />
    </div>
  )
}
