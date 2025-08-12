import React, { useState, useEffect, useRef } from "react";
import {
  FiImage,
  FiRefreshCw,
  FiDownload,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import html2canvas from "html2canvas";

interface TextBox {
  id: number;
  text: string;
  x: number;
  y: number;
  isDragging: boolean;
  fontSize: number;
  color: string;
  strokeColor: string;
}

interface MemeData {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  box_count: number;
}

interface MemeImage {
  image: string;
}

export default function Meme(): JSX.Element {
  const [allMemes, setAllMemes] = useState<MemeData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const memeRef = useRef<HTMLDivElement>(null);
 

  // Array of text boxes that can be dragged
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([
    {
      id: 1,
      text: "",
      x: 50,
      y: 10,
      isDragging: false,
      fontSize: 28,
      color: "white",
      strokeColor: "black",
    },
  ]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("https://api.imgflip.com/get_memes");
        const data = await res.json();
        setAllMemes(data.data.memes);
      } catch (error) {
        console.error("Failed to fetch memes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function getMemeImage(): string {
    if (allMemes.length === 0) return "http://i.imgflip.com/1bij.jpg";
    const randomMeme = allMemes[Math.floor(Math.random() * allMemes.length)];
    return randomMeme.url;
  }

  const [memeImage, setMemeImage] = useState<MemeImage>({
    image: "http://i.imgflip.com/1bij.jpg",
  });

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    setCustomImage(null);
    setMemeImage((prevState) => ({
      ...prevState,
      image: getMemeImage(),
    }));
  }

  function handleDragStart(id: number, e: React.MouseEvent): void {
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent): void => {
      setTextBoxes((prevBoxes) =>
        prevBoxes.map((box) =>
          box.id === id
            ? {
                ...box,
                x: box.x + (moveEvent.clientX - startX) / 10,
                y: box.y + (moveEvent.clientY - startY) / 10,
                isDragging: true,
              }
            : box
        )
      );
    };

    const handleMouseUp = (): void => {
      setTextBoxes((prevBoxes) =>
        prevBoxes.map((box) =>
          box.id === id ? { ...box, isDragging: false } : box
        )
      );
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  function handleTextChange(
    id: number,
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    const { value } = event.target;
    setTextBoxes((prevBoxes) =>
      prevBoxes.map((box) => (box.id === id ? { ...box, text: value } : box))
    );
  }

  function addNewTextBox(): void {
    const newId = textBoxes.length + 1;
    setTextBoxes([
      ...textBoxes,
      {
        id: newId,
        text: "",
        x: 50,
        y: 50,
        isDragging: false,
        fontSize: 28,
        color: "white",
        strokeColor: "black",
      },
    ]);
  }

  function removeTextBox(id: number): void {
    setTextBoxes(textBoxes.filter((box) => box.id !== id));
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (file && file.type.match("image.*")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          setCustomImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async function downloadMeme(): Promise<void> {
    if (!memeRef.current) {
      alert("Meme preview not found. Please try again.");
      return;
    }

    // Check if the image is loaded and not tainted
    const img = memeRef.current.querySelector('img');
    if (img && !img.complete) {
      alert("Image is still loading. Please wait a moment and try again.");
      return;
    }

    try {
      // Apply a specific style for capturing to ensure everything is visible
      const originalPosition = memeRef.current.style.position;
      memeRef.current.style.position = "relative";

      const canvas = await html2canvas(memeRef.current, {
        allowTaint: false, // safer for CORS
        useCORS: true,
        logging: true,
        backgroundColor: '#222', // fallback background
        scale: 2, // Higher quality
      });

      // Restore original style
      memeRef.current.style.position = originalPosition;

      if (!canvas) {
        alert("Failed to render meme. This may be due to CORS issues with the image source. Try uploading your own image.");
        return;
      }

      // Convert the canvas to a data URL
      const dataUrl = canvas.toDataURL("image/png");
      if (!dataUrl || dataUrl === "data:,") {
        alert("Failed to generate image. This may be due to CORS issues with the meme image. Try uploading your own image.");
        return;
      }

      // Create a download link
      const link = document.createElement("a");
      link.download = `meme-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();

      console.log("Meme downloaded successfully!");
    } catch (error) {
      console.error("Failed to download meme:", error);
      alert("Failed to download meme. This may be due to CORS issues with the image source. Try uploading your own image.");
    }
  }

  function changeFontSize(id: number, increment: number): void {
    setTextBoxes((prevBoxes) =>
      prevBoxes.map((box) =>
        box.id === id
          ? { ...box, fontSize: Math.max(12, box.fontSize + increment) }
          : box
      )
    );
  }

  function changeTextColor(id: number, color: string): void {
    setTextBoxes((prevBoxes) =>
      prevBoxes.map((box) => (box.id === id ? { ...box, color } : box))
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-12 border border-gray-200">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow">Meme Generator</span>
            <span className="text-base font-medium text-gray-400 ml-2">by <a href="https://github.com/bishnuf66" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-indigo-600 transition"><svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='currentColor' viewBox='0 0 24 24' className='inline'><path d='M12 .5C5.648.5.5 5.648.5 12c0 5.086 3.292 9.387 7.86 10.907.574.106.784-.25.784-.555 0-.274-.01-1.18-.015-2.14-3.197.695-3.874-1.54-3.874-1.54-.522-1.326-1.276-1.68-1.276-1.68-1.044-.714.08-.7.08-.7 1.155.082 1.763 1.187 1.763 1.187 1.026 1.76 2.693 1.252 3.35.958.104-.743.402-1.252.73-1.54-2.553-.29-5.238-1.277-5.238-5.687 0-1.256.448-2.283 1.184-3.088-.119-.29-.513-1.46.112-3.045 0 0 .966-.31 3.17 1.18.92-.256 1.91-.384 2.894-.388.983.004 1.974.132 2.895.388 2.202-1.49 3.166-1.18 3.166-1.18.627 1.585.233 2.755.114 3.045.738.805 1.183 1.832 1.183 3.088 0 4.42-2.689 5.393-5.252 5.678.413.355.78 1.057.78 2.132 0 1.54-.014 2.78-.014 3.16 0 .308.207.666.79.553C20.713 21.383 24 17.083 24 12c0-6.352-5.148-11.5-12-11.5z'/></svg> bishnuf66</a></span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Left side - Controls */}
            <div className="bg-white/70 rounded-2xl shadow p-6 border border-gray-100">
              <div className="space-y-4">
                {/* Text boxes controls */}
                <div className="space-y-4">
                  {textBoxes.map((box) => (
                    <div
                      key={box.id}
                      className="flex flex-col space-y-2 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">
                          Text Box {box.id}
                        </label>
                        <button
                          onClick={() => removeTextBox(box.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove this text box"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={box.text}
                        onChange={(e) => handleTextChange(box.id, e)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Enter text"
                      />
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => changeFontSize(box.id, -2)}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                          title="Decrease font size"
                        >
                          A-
                        </button>
                        <button
                          onClick={() => changeFontSize(box.id, 2)}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                          title="Increase font size"
                        >
                          A+
                        </button>
                        <div className="flex space-x-1 ml-2">
                          {["white", "yellow", "red", "blue", "green"].map(
                            (color) => (
                              <button
                                key={color}
                                onClick={() => changeTextColor(box.id, color)}
                                className="w-6 h-6 rounded-full border border-gray-300"
                                style={{ backgroundColor: color }}
                                title={`Change text to ${color}`}
                              />
                            )
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Drag text on the image to position it
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addNewTextBox}
                  className="flex items-center justify-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FiPlus className="mr-2" /> Add Text Box
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex space-x-4">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    disabled={loading}
                  >
                    <FiRefreshCw
                      className={`mr-2 ${loading ? "animate-spin" : ""}`}
                    />
                    {loading ? "Loading..." : "Random Meme"}
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FiImage className="mr-2" />
                    Upload Image
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <button
                  onClick={downloadMeme}
                  className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out transform hover:scale-105"
                >
                  <FiDownload className="mr-2" />
                  Download Meme
                </button>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Your meme will be saved as a PNG image
                </p>
              </div>
            </div>

            {/* Right side - Meme Preview */}
            <div
              className="relative border rounded-lg overflow-hidden shadow-lg"
              ref={memeRef}
              style={{ background: '#222' }}
            >
              <div className="relative">
                <img
                  src={customImage || memeImage.image}
                  alt="meme"
                  className="w-full object-contain max-h-[400px]"
                  crossOrigin="anonymous" // For html2canvas to work with external images
                />

                {textBoxes.map((box) => (
                  <div
                    key={box.id}
                    className={`absolute cursor-move ${
                      box.isDragging ? "opacity-80" : ""
                    }`}
                    style={{
                      top: `${box.y}%`,
                      left: `${box.x}%`,
                      transform: "translate(-50%, -50%)",
                      userSelect: "none",
                      zIndex: 10, // Ensure text is above image
                    }}
                    onMouseDown={(e) => handleDragStart(box.id, e)}
                  >
                    <p
                      className={`text-center font-bold uppercase meme-text`}
                      style={{
                        color: box.color || '#fff',
                        fontSize: `${box.fontSize}px`,
                        textShadow: `2px 2px 0 ${box.strokeColor || '#000'}, -2px -2px 0 ${box.strokeColor || '#000'}, 2px -2px 0 ${box.strokeColor || '#000'}, -2px 2px 0 ${box.strokeColor || '#000'}, 0 2px 0 ${box.strokeColor || '#000'}, 2px 0 0 ${box.strokeColor || '#000'}, 0 -2px 0 ${box.strokeColor || '#000'}, -2px 0 0 ${box.strokeColor || '#000'}, 2px 2px 5px ${box.strokeColor || '#000'}`,
                      }}
                    >
                      {box.text}
                    </p>
                  </div>
                ))}
              </div>
              <div style={{ position: 'absolute', bottom: 8, right: 8, zIndex: 20, fontSize: 12, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: 999 }}>
                Meme Generator
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
