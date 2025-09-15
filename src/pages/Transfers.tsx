import { useState, useRef } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Upload, ArrowRight, Package, FileText, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Mock data for warehouses
const mockWarehouses = [
  { id: 1, name: "Depósito Central", address: "Av. Principal 123" },
  { id: 2, name: "Depósito Norte", address: "Zona Norte Industrial" },
  { id: 3, name: "Depósito Sur", address: "Parque Industrial Sur" },
];

// Mock detected products
const mockDetectedProducts = [
  { id: 1, name: "Producto A", quantity: 5, confidence: 95, image: "/api/placeholder/80/80" },
  { id: 2, name: "Producto B", quantity: 3, confidence: 87, image: "/api/placeholder/80/80" },
  { id: 3, name: "Producto C", quantity: 12, confidence: 92, image: "/api/placeholder/80/80" },
];

export default function Transfers() {
  const [fromWarehouse, setFromWarehouse] = useState("");
  const [toWarehouse, setToWarehouse] = useState("");
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [detectedProducts, setDetectedProducts] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen no puede superar los 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setScannedImage(e.target?.result as string);
        simulateScanning();
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateScanning = () => {
    setIsScanning(true);
    setTimeout(() => {
      setDetectedProducts(mockDetectedProducts);
      setIsScanning(false);
      toast({
        title: "Productos detectados",
        description: `Se encontraron ${mockDetectedProducts.length} productos`,
      });
    }, 3000);
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    setDetectedProducts(products =>
      products.map(p => 
        p.id === id ? { ...p, quantity: Math.max(0, newQuantity) } : p
      )
    );
  };

  const removeProduct = (id: number) => {
    setDetectedProducts(products => products.filter(p => p.id !== id));
  };

  const generateTransferOrder = () => {
    if (!fromWarehouse || !toWarehouse || detectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Complete todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    // Simulate remito generation
    toast({
      title: "Remito generado",
      description: `Transferencia desde ${fromWarehouse} hacia ${toWarehouse} creada exitosamente`,
    });
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setCameraStream(stream);
      setIsCameraOpen(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara",
        variant: "destructive",
      });
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setScannedImage(dataUrl);
        closeCamera();
        simulateScanning();
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Transferencias entre Depósitos
          </h1>
          <p className="text-muted-foreground">
            Genera remitos de transferencia escaneando productos
          </p>
        </div>

        {/* Warehouse Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Seleccionar Depósitos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from-warehouse">Depósito Origen</Label>
                <Select value={fromWarehouse} onValueChange={setFromWarehouse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar origen" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWarehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.name}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="to-warehouse">Depósito Destino</Label>
                <Select value={toWarehouse} onValueChange={setToWarehouse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWarehouses
                      .filter(w => w.name !== fromWarehouse)
                      .map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.name}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Scanning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Escanear Productos para Transferir
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!scannedImage ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sube una imagen de los productos a transferir o toma una foto
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={openCamera} className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Abrir Cámara
                      </Button>
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <Button variant="outline" asChild>
                          <span className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Subir Imagen
                          </span>
                        </Button>
                      </Label>
                    </div>
                    <Input
                      ref={fileInputRef}
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={scannedImage}
                    alt="Imagen escaneada"
                    className="max-w-md max-h-64 object-contain rounded-lg border"
                  />
                </div>
                {isScanning && (
                  <div className="text-center py-4">
                    <div className="animate-pulse text-primary font-medium">
                      Procesando imagen...
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detected Products */}
        {detectedProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos Detectados ({detectedProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {detectedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-3 border rounded-lg"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{product.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={product.confidence > 90 ? "default" : "secondary"}>
                          {product.confidence}% confianza
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(product.id, product.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center font-medium">
                        {product.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(product.id, product.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeProduct(product.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={generateTransferOrder}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Generar Remito de Transferencia
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Camera Modal */}
      <Dialog open={isCameraOpen} onOpenChange={closeCamera}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Capturar Foto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
                style={{ transform: 'scaleX(-1)' }}
              />
            </div>
            <div className="flex justify-center gap-3">
              <Button onClick={capturePhoto} className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Capturar
              </Button>
              <Button variant="outline" onClick={closeCamera} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Layout>
  );
}