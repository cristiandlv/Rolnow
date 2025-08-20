"use client";
export const dynamic = "force-dynamic";
import { useParams } from "next/navigation";
import TablePage from "@/app/components/TablePage";

export default function RoomPage() {
  const params = useParams();
  const roomId = params?.roomId as string;
  if (!roomId) return <p className="text-white">Cargando sala...</p>;
  return <TablePage roomId={roomId} />;
}
