import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, 
  Upload, 
  Loader2, 
  Package, 
  Plus, 
  Minus, 
  X,
  CheckCircle,
  AlertTriangle,
  ShoppingCart
} from "lucide-react";
import heroImage from "@/assets/hero-scanning.jpg";
import TicketModal from "@/components/modals/TicketModal";

interface DetectedProduct {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  confidence: number;
  image: string;
  price: number;
}

export default function ProductScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedProducts, setDetectedProducts] = useState<DetectedProduct[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Mock detected products for demo
  const mockProducts: DetectedProduct[] = [
    {
      id: "1",
      name: "Aceite de Oliva Extra Virgen 500ml",
      sku: "AOL-500",
      quantity: 3,
      confidence: 95,
      image: "/placeholder.svg",
      price: 8.50
    },
    {
      id: "2", 
      name: "Arroz Integral 1kg",
      sku: "ARR-1000",
      quantity: 2,
      confidence: 87,
      image: "/placeholder.svg", 
      price: 3.20
    },
    {
      id: "3",
      name: "Pasta Italiana 500g",
      sku: "PAS-500",
      quantity: 1,
      confidence: 45,
      image: "/placeholder.svg",
      price: 2.90
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo inválido",
        description: "Solo se permiten archivos JPG y PNG",
        variant: "destructive"
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "Archivo muy grande",
        description: "El tamaño máximo permitido es 5MB",
        variant: "destructive"
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      processImage();
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    setIsScanning(true);
    setDetectedProducts([]);

    // Simulate AI processing with delay
    setTimeout(() => {
      setDetectedProducts(mockProducts);
      setIsScanning(false);
      toast({
        title: "Escaneo completado",
        description: `Se detectaron ${mockProducts.length} productos`,
      });
    }, 3000);
  };

  const updateQuantity = (productId: string, change: number) => {
    setDetectedProducts(products =>
      products.map(product =>
        product.id === productId
          ? { ...product, quantity: Math.max(0, product.quantity + change) }
          : product
      ).filter(product => product.quantity > 0)
    );
  };

  const removeProduct = (productId: string) => {
    setDetectedProducts(products =>
      products.filter(product => product.id !== productId)
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "success";
    if (confidence >= 60) return "warning";
    return "destructive";
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return CheckCircle;
    if (confidence >= 60) return AlertTriangle;
    return AlertTriangle;
  };

  const getTotalAmount = () => {
    return detectedProducts.reduce((total, product) => 
      total + (product.quantity * product.price), 0
    ).toFixed(2);
  };

  const handleGenerateOrder = () => {
    if (detectedProducts.length === 0) {
      toast({
        title: "No hay productos",
        description: "Escanea algunos productos primero",
        variant: "destructive"
      });
      return;
    }

    // Verificar si hay productos con baja confianza
    const lowConfidenceProducts = detectedProducts.filter(p => p.confidence < 60);
    if (lowConfidenceProducts.length > 0) {
      toast({
        title: "Productos requieren confirmación",
        description: `${lowConfidenceProducts.length} productos tienen baja confianza`,
        variant: "destructive"
      });
      return;
    }

    setIsTicketModalOpen(true);
  };

  const handleOrderGenerated = () => {
    // Limpiar el scanner después de generar el pedido
    setDetectedProducts([]);
    setSelectedImage(null);
    
    toast({
      title: "¡Pedido generado!",
      description: "El pedido se ha procesado correctamente",
    });
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Usar cámara trasera en móviles
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      setCameraStream(stream);
      setIsCameraOpen(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Error al acceder a la cámara",
        description: "Asegúrate de dar permisos de cámara al navegador",
        variant: "destructive"
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
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0);
    
    // Convert canvas to data URL
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    // Close camera and process image
    closeCamera();
    setSelectedImage(photoDataUrl);
    processImage();
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-primary/10 to-primary/5">
          <img 
            src={heroImage} 
            alt="Scanning Interface" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Package className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Scanner de Productos
              </h2>
              <p className="text-muted-foreground">
                Identifica productos automáticamente con inteligencia artificial
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Scanning Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Capturar Imagen</CardTitle>
          <CardDescription>
            Toma una foto o sube una imagen para identificar productos automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              size="lg"
              className="h-24 flex-col gap-2"
              onClick={openCamera}
              disabled={isScanning}
            >
              <Camera className="h-8 w-8" />
              Tomar Foto
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="h-24 flex-col gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
            >
              <Upload className="h-8 w-8" />
              Subir Archivo
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileUpload}
            className="hidden"
          />

          {selectedImage && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Imagen seleccionada:</p>
              <img
                src={selectedImage}
                alt="Selected"
                className="max-w-xs h-32 object-cover rounded-lg border"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing State */}
      {isScanning && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
              <h3 className="text-lg font-semibold">Procesando imagen...</h3>
              <p className="text-muted-foreground">
                Identificando productos con inteligencia artificial
              </p>
              <Progress value={75} className="w-full max-w-sm mx-auto" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detection Results */}
      {detectedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Productos Detectados</CardTitle>
                <CardDescription>
                  {detectedProducts.length} productos identificados
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                Total: ${getTotalAmount()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {detectedProducts.map((product) => {
                const ConfidenceIcon = getConfidenceIcon(product.confidence);
                
                return (
                  <Card key={product.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg bg-muted"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          SKU: {product.sku} • ${product.price}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <ConfidenceIcon className={`h-4 w-4 text-${getConfidenceColor(product.confidence)}`} />
                          <span className="text-xs text-muted-foreground">
                            Confianza: {product.confidence}%
                          </span>
                          {product.confidence < 60 && (
                            <Badge variant="destructive" className="text-xs">
                              Requiere confirmación
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(product.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="w-12 text-center font-medium">
                          {product.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(product.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeProduct(product.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}

              <div className="flex justify-end pt-4">
                <Button size="lg" className="gap-2" onClick={handleGenerateOrder}>
                  <ShoppingCart className="h-5 w-5" />
                  Generar Pedido
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Capturar Foto</h3>
              <Button variant="ghost" size="sm" onClick={closeCamera}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="relative bg-muted rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
              </div>
              
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={closeCamera}>
                  Cancelar
                </Button>
                <Button onClick={capturePhoto}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capturar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Modals */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        products={detectedProducts.map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          quantity: p.quantity,
          price: p.price
        }))}
        onTicketGenerated={handleOrderGenerated}
      />
    </div>
  );
}