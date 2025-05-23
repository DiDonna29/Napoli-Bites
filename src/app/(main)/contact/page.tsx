import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-lora font-bold text-primary mb-4">Get In Touch</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We&apos;d love to hear from you! Whether it&apos;s feedback, a question, or a catering inquiry, drop us a line.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-lora">Contact Form</CardTitle>
            <CardDescription>Send us a message directly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Your Name" />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="your.email@example.com" />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Reason for contacting" />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Your message..." className="min-h-[120px]" />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Send Message
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-lora flex items-center">
                <MapPin className="mr-3 h-6 w-6 text-primary" /> Our Pizzeria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">123 Pizza Street, Naples, Italy, 00100</p>
              <p className="mt-2">
                <Link href="#" className="text-primary hover:underline">Get Directions</Link>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-lora flex items-center">
                <Phone className="mr-3 h-6 w-6 text-primary" /> Call Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Reservations & Inquiries: <a href="tel:+390123456789" className="text-primary hover:underline">+39 0123 456789</a></p>
              <p className="text-muted-foreground">Catering: <a href="tel:+390123456780" className="text-primary hover:underline">+39 0123 456780</a></p>
            </CardContent>
          </Card>
           <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-lora flex items-center">
                <Mail className="mr-3 h-6 w-6 text-primary" /> Email Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">General: <a href="mailto:info@napolibites.com" className="text-primary hover:underline">info@napolibites.com</a></p>
               <p className="text-muted-foreground">Support: <a href="mailto:support@napolibites.com" className="text-primary hover:underline">support@napolibites.com</a></p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
