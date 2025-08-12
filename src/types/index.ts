export interface TextBox {
  id: number;
  text: string;
  x: number;
  y: number;
  isDragging: boolean;
  fontSize: number;
  color: string;
  strokeColor: string;
}

export interface MemeData {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  box_count: number;
}

export interface MemeImage {
  image: string;
}