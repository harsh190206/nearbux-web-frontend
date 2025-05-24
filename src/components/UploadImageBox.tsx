const ImageUploadBox = ({
  onChange,
  file,
}: {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file?: File | null;
}) => (
  <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center mb-4 w-72">
    <div className="flex flex-col items-center">
      <svg
        className="w-10 h-10 text-blue-400 mb-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v6m0 0l-3-3m3 3l3-3m-6-6V7a4 4 0 018 0v3"
        />
      </svg>
      <span className="font-semibold text-gray-500 mb-1">
        Drag Image To Upload
      </span>
      <span className="text-gray-500 mb-2">or</span>
      <label className="inline-block cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-4 py-1 rounded mb-2">
        Browse Image
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          className="hidden"
          onChange={onChange}
        />
      </label>
      <span className="block text-xs text-gray-500">
        JPEG, JPG, PNG format, up to 50 KB
      </span>
      {file && (
        <span className="block mt-2 text-xs text-green-600">
          {file.name}
        </span>
      )}
    </div>
  </div>
);

export default ImageUploadBox;
