import React, { useState, useEffect } from 'react';
import { useMenu, type MenuItem } from '@/contexts/MenuContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit3, Trash2, Save, X, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const { menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability } = useMenu();
  const { toast } = useToast();

  const blankItem: Partial<MenuItem> = {
    name: '',
    description: '',
    price: 0,
    category: 'mains',
    is_veg: false,
    spice_level: 'mild',
    image_url: '',
    available: true,
  };

  const [activeItem, setActiveItem] = useState<Partial<MenuItem>>(blankItem);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setActiveItem(blankItem);
    }
  }, [isEditing]);

  const handleSelectForEdit = (item: MenuItem) => {
    setIsEditing(true);
    setActiveItem(item);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setActiveItem(blankItem);
  };

  const handleSubmit = async () => {
    if (!activeItem.name || activeItem.price! <= 0) {
      toast({ title: 'Validation Error', description: 'Name and a valid price are required.', variant: 'destructive' });
      return;
    }

    if (isEditing) {
      await updateMenuItem(activeItem.id!, activeItem);
    } else {
      await addMenuItem(activeItem as Omit<MenuItem, 'id'|'created_at'|'updated_at'|'available'>);
    }
    handleCancel();
  };

  const renderForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Menu Item' : 'Add New Item'}</CardTitle>
        <CardDescription>{isEditing ? 'Modify the details of the existing item.' : 'Fill out the form to add a new item to the menu.'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Chicken Tikka" value={activeItem.name || ''} onChange={e => setActiveItem({ ...activeItem, name: e.target.value })} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="e.g. Tender chicken pieces marinated in yogurt and spices" value={activeItem.description || ''} onChange={e => setActiveItem({ ...activeItem, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" type="number" placeholder="e.g. 12.99" value={activeItem.price?.toString() || ''} onChange={e => setActiveItem({ ...activeItem, price: Number(e.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={activeItem.category} onValueChange={v => setActiveItem({ ...activeItem, category: v })}>
              <SelectTrigger id="category"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>{categories.filter(c => c.id !== 'all').map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="spice_level">Spice Level</Label>
            <Select value={activeItem.spice_level} onValueChange={v => setActiveItem({ ...activeItem, spice_level: v })}>
              <SelectTrigger id="spice_level"><SelectValue placeholder="Spice Level" /></SelectTrigger>
              <SelectContent>{['mild', 'medium', 'hot'].map(level => <SelectItem key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="image_url">Image</Label>
            <Input id="image_url" placeholder="URL or Emoji (e.g. 🍗)" value={activeItem.image_url || ''} onChange={e => setActiveItem({ ...activeItem, image_url: e.target.value })} />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Switch id="is_veg" checked={activeItem.is_veg || false} onCheckedChange={v => setActiveItem({ ...activeItem, is_veg: v })} />
            <Label htmlFor="is_veg">Vegetarian</Label>
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Switch id="available" checked={activeItem.available || false} onCheckedChange={v => setActiveItem({ ...activeItem, available: v })} />
            <Label htmlFor="available">Available</Label>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {isEditing && <Button variant="outline" onClick={handleCancel}><X className="mr-2 h-4 w-4" />Cancel</Button>}
        <Button onClick={handleSubmit}><Save className="mr-2 h-4 w-4" />{isEditing ? 'Save Changes' : 'Create Item'}</Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto py-10 px-4">
      <header className="mb-8">
        <h1 className="text-4xl font-playfair font-bold">Menu Management</h1>
        <p className="text-muted-foreground">Add, edit, and manage your restaurant's menu items.</p>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-semibold">Menu Items ({menuItems.length})</h2>
          {menuItems.length > 0 ? (
            menuItems.map(item => (
              <Card key={item.id} className="flex items-center p-4 transition-all hover:shadow-md">
                <div className="text-4xl mr-4">{item.image_url && item.image_url.length < 5 ? item.image_url : <UtensilsCrossed />}</div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {item.is_veg && <Badge variant="outline" className="border-green-500 text-green-600">Veg</Badge>}
                    <Badge variant="outline">{item.spice_level}</Badge>
                    <Badge variant={item.available ? 'default' : 'secondary'}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="icon" variant="ghost" onClick={() => handleSelectForEdit(item)}><Edit3 className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMenuItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            ))
          ) : (
            <p>No menu items found. Add one to get started!</p>
          )}
        </div>
        <aside className="lg:col-span-1 sticky top-24">
          {renderForm()}
        </aside>
      </main>
    </div>
  );
};

export default Admin;
