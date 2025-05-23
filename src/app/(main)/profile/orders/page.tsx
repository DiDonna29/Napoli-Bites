import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ListOrdered, FileText } from "lucide-react";

// Mock data, in a real app this would come from a database
const mockOrders = [
  {
    id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    date: "2023-10-26",
    total: 45.99,
    status: "Delivered",
    items: [
      { name: "Pepperoni Pizza (L)", quantity: 1 },
      { name: "Coca-Cola", quantity: 4 },
    ],
    type: "Delivery"
  },
  {
    id: "f0e1d2c3-b4a5-6789-0123-456789abcdef",
    date: "2023-10-20",
    total: 22.50,
    status: "Completed",
    items: [
      { name: "Margherita (M)", quantity: 1 },
      { name: "Sparkling Water", quantity: 1 },
    ],
    type: "Pickup"
  },
  {
    id: "12345678-90ab-cdef-0123-456789abcdef",
    date: "2023-09-15",
    total: 35.75,
    status: "Completed",
    items: [
      { name: "Quattro Formaggi (M)", quantity: 1 },
      { name: "Chianti (Glass)", quantity: 2 },
    ],
    type: "Dine-in"
  },
];

export default function OrderHistoryPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-lora font-bold text-primary">My Orders</h1>
        <Link href="/profile" className="text-sm text-primary hover:underline">
          Back to Profile
        </Link>
      </div>

      {mockOrders.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <ListOrdered className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>No Orders Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>You haven&apos;t placed any orders with us. Start exploring our menu!</CardDescription>
          </CardContent>
          <CardFooter className="justify-center">
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/#menu">Browse Menu</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-8">
          {mockOrders.map((order) => (
            <Card key={order.id} className="shadow-lg">
              <CardHeader className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <CardTitle className="text-xl">Order #{order.id.substring(0, 8)}...</CardTitle>
                  <CardDescription>Date: {new Date(order.date).toLocaleDateString()}</CardDescription>
                </div>
                <div className="md:text-center">
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-semibold">{order.type}</p>
                </div>
                <div className="md:text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-semibold text-primary">${order.total.toFixed(2)}</p>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <h4 className="font-semibold mb-2 text-sm">Items:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {order.items.map((item, index) => (
                    <li key={index}>{item.name} (x{item.quantity})</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <Badge variant={order.status === "Delivered" || order.status === "Completed" ? "default" : "secondary"}
                       className={order.status === "Delivered" || order.status === "Completed" ? "bg-green-600 text-white" : ""}>
                  {order.status}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/confirmation/${order.id}?total=${order.total.toFixed(2)}&orderType=${order.type}`}> {/* Link to a generic confirmation/invoice view */}
                    <FileText className="mr-2 h-4 w-4" /> View Invoice
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
