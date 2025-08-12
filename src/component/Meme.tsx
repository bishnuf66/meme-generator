import React, { useState, useEffect, useRef } from "react";
import { FiImage, FiRefreshCw, FiDownload, FiPlus, FiTrash2 } from "react-icons/fi";
import html2canvas from 'html2canvas';

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
        { id: 1, text: "", x: 50, y: 10, isDragging: false, fontSize: 28, color: "white", strokeColor: "black" }
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
            setTextBoxes(prevBoxes => 
                prevBoxes.map(box => 
                    box.id === id 
                        ? { 
                            ...box, 
                            x: box.x + (moveEvent.clientX - startX) / 10, 
                            y: box.y + (moveEvent.clientY - startY) / 10,
                            isDragging: true 
                        } 
                        : box
                )
            );
        };
        
        const handleMouseUp = (): void => {
            setTextBoxes(prevBoxes => 
                prevBoxes.map(box => 
                    box.id === id ? { ...box, isDragging: false } : box
                )
            );
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    function handleTextChange(id: number, event: React.ChangeEvent<HTMLInputElement>): void {
        const { value } = event.target;
        setTextBoxes(prevBoxes =>
            prevBoxes.map(box =>
                box.id === id ? { ...box, text: value } : box
            )
        );
    }

    function addNewTextBox(): void {
        const newId = textBoxes.length + 1;
        setTextBoxes([
            ...textBoxes,
            { id: newId, text: "", x: 50, y: 50, isDragging: false, fontSize: 28, color: "white", strokeColor: "black" }
        ]);
    }

    function removeTextBox(id: number): void {
        setTextBoxes(textBoxes.filter(box => box.id !== id));
    }

    function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>): void {
        const file = event.target.files?.[0];
        if (file && file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    setCustomImage(result);
                }
            };
            reader.readAsDataURL(file);
        }
    }

    async function downloadMeme(): Promise<void> {
        if (!memeRef.current) return;
        
        try {
            const canvas = await html2canvas(memeRef.current);
            const dataUrl = canvas.toDataURL("image/png");
            
            // Create a download link
            const link = document.createElement('a');
            link.download = 'my-meme.png';
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Failed to download meme:", error);
            alert("Failed to download meme. Please try again.");
        }
    }

    function changeFontSize(id: number, increment: number): void {
        setTextBoxes(prevBoxes =>
            prevBoxes.map(box =>
                box.id === id 
                ? { ...box, fontSize: Math.max(12, box.fontSize + increment) } 
                : box
            )
        );
    }

    function changeTextColor(id: number, color: string): void {
        setTextBoxes(prevBoxes =>
            prevBoxes.map(box =>
                box.id === id ? { ...box, color } : box
            )
        );
    }

    return (
        <main className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Customize Your Meme</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Left side - Controls */}
                        <div>
                            <div className="space-y-4">
                                {/* Text boxes controls */}
                                <div className="space-y-4">
                                    {textBoxes.map((box) => (
                                        <div key={box.id} className="flex flex-col space-y-2 p-4 bg-gray-50 rounded-lg">
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
                                                    {['white', 'yellow', 'red', 'blue', 'green'].map(color => (
                                                        <button 
                                                            key={color}
                                                            onClick={() => changeTextColor(box.id, color)}
                                                            className="w-6 h-6 rounded-full border border-gray-300"
                                                            style={{ backgroundColor: color }}
                                                            title={`Change text to ${color}`}
                                                        />
                                                    ))}
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
                                        <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                                        {loading ? 'Loading...' : 'Random Meme'}
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
                                    className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <FiDownload className="mr-2" />
                                    Download Meme
                                </button>
                            </div>
                        </div>
                        
                        {/* Right side - Meme Preview */}
                        <div className="relative border rounded-lg overflow-hidden bg-gray-800" ref={memeRef}>
                            <div className="relative">
                                <img 
                                    src={customImage || memeImage.image} 
                                    alt="meme" 
                                    className="w-full object-contain max-h-[400px]" 
                                />
                                
                                {textBoxes.map((box) => (
                                    <div
                                        key={box.id}
                                        className={`absolute cursor-move ${box.isDragging ? 'opacity-80' : ''}`}
                                        style={{ 
                                            top: `${box.y}%`, 
                                            left: `${box.x}%`, 
                                            transform: 'translate(-50%, -50%)',
                                            userSelect: 'none'
                                        }}
                                        onMouseDown={(e) => handleDragStart(box.id, e)}
                                    >
                                        <p
                                            className={`text-center font-bold uppercase meme-text`}
                                            style={{ 
                                                color: box.color,
                                                fontSize: `${box.fontSize}px`,
                                                textShadow: `2px 2px 0 ${box.strokeColor}, -2px -2px 0 ${box.strokeColor}, 2px -2px 0 ${box.strokeColor}, -2px 2px 0 ${box.strokeColor}, 0 2px 0 ${box.strokeColor}, 2px 0 0 ${box.strokeColor}, 0 -2px 0 ${box.strokeColor}, -2px 0 0 ${box.strokeColor}, 2px 2px 5px ${box.strokeColor}`
                                            }}
                                        >
                                            {box.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}