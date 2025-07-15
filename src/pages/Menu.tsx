import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, UtensilsCrossed, Search } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useMenu, type MenuItem } from '@/contexts/MenuContext';

const Menu = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart, updateQuantity, items } = useCart();
  const { menuItems, categories, loading } = useMenu();

  const getCartQuantity = (itemId: string) => {
    const match = items.find(i => i.id === itemId);
    return match ? match.quantity : 0;
  };

  const filteredItems = menuItems
    .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAddToCart = (item: MenuItem) => {
    if (!item.available) {
      toast({ title: 'Unavailable', description: 'This item is currently not available.', variant: 'destructive' });
      return;
    }
    addToCart({ id: String(item.id), name: item.name, price: item.price, image_url: item.image_url });
  };

  const spiceBadgeClass = (level: string | null) => {
    switch (level) {
      case 'mild': return 'border-green-300 bg-green-50 text-green-700';
      case 'medium': return 'border-yellow-300 bg-yellow-50 text-yellow-700';
      case 'hot': return 'border-red-300 bg-red-50 text-red-700';
      default: return 'border-gray-300 bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-playfair font-bold mb-4">Our Exquisite Menu</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Explore a symphony of flavors, crafted with the freshest ingredients and authentic Indian spices.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for your favorite dish..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Loading menu...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
            <Card key={item.id} className="flex flex-col overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="p-0">
                <div className="aspect-video bg-muted flex items-center justify-center text-5xl">
                  {item.image_url && item.image_url.length < 5 ? item.image_url : <UtensilsCrossed className="text-muted-foreground" />}
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-6 space-y-3">
                <CardTitle className="font-playfair">{item.name}</CardTitle>
                <div className="flex gap-2">
                  {item.is_veg && <Badge variant="outline" className="border-green-500 text-green-600">Veg</Badge>}
                  <Badge variant="outline" className={spiceBadgeClass(item.spice_level)}>{item.spice_level}</Badge>
                  {!item.available && <Badge variant="destructive">Unavailable</Badge>}
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
              <CardFooter className="flex justify-between items-center p-6 bg-muted/50">
                <p className="text-2xl font-semibold">${item.price.toFixed(2)}</p>
                {getCartQuantity(item.id) > 0 ? (
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" onClick={() => updateQuantity(item.id, getCartQuantity(item.id) - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-lg min-w-[2rem] text-center">{getCartQuantity(item.id)}</span>
                    <Button size="icon" variant="outline" onClick={() => handleAddToCart(item)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => handleAddToCart(item)} disabled={!item.available}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold mb-2">No Dishes Found</h2>
          <p className="text-muted-foreground">
            {searchTerm ? `No results for "${searchTerm}".` : 'No items in this category.'} Try a different search or category.
          </p>
        </div>
      )}
    </div>
  );
};

export default Menu;
