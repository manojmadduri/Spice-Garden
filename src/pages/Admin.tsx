import React, { useState, useEffect } from 'react';
import { useMenu, type MenuItem } from '@/contexts/MenuContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import CardHover from '@/components/ui/card-hover';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const { menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability } = useMenu();
  const { toast } = useToast();

  const blank: Partial<MenuItem> = {
    name: '',
    description: '',
    price: 0,
    category: 'mains',
    is_veg: false,
    spice_level: 'mild',
    image_url: '',
    available: true,
  };

  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>(blank);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Partial<MenuItem>>(blank);

  useEffect(() => {
    if (editingId) {
      const item = menuItems.find(i => i.id === editingId);
      if (item) setEditItem(item);
    } else {
      setEditItem(blank);
    }
  }, [editingId, menuItems]);

  const handleAdd = async () => {
    if (!newItem.name || newItem.price! <= 0) {
      toast({ title: 'Missing fields', description: 'Name and valid price are required.', variant: 'destructive' });
      return;
    }
    await addMenuItem(newItem as Omit<MenuItem, 'id'|'created_at'|'updated_at'|'available'>);
    setIsAdding(false);
    setNewItem(blank);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    await updateMenuItem(editingId, editItem);
    setEditingId(null);
  };

  const renderForm = (item: Partial<MenuItem>, setItem: React.Dispatch<React.SetStateAction<Partial<MenuItem>>>) => (
    <div className="space-y-4">
      <Input placeholder="Name" value={item.name || ''} onChange={e => setItem({ ...item, name: e.target.value })} />
      <Textarea placeholder="Description" value={item.description || ''} onChange={e => setItem({ ...item, description: e.target.value })} />
      <Input type="number" placeholder="Price" value={item.price?.toString() || ''} onChange={e => setItem({ ...item, price: Number(e.target.value) })} />
      <Select value={item.category} onValueChange={v => setItem({ ...item, category: v })}>
        <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
        <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
      </Select>
      <div className="flex items-center space-x-2">
        <Switch checked={item.is_veg || false} onCheckedChange={v => setItem({ ...item, is_veg: v })} />
        <Label>Vegetarian</Label>
      </div>
      <Select value={item.spice_level} onValueChange={v => setItem({ ...item, spice_level: v })}>
        <SelectTrigger><SelectValue placeholder="Spice Level" /></SelectTrigger>
        <SelectContent>
          {['mild','medium','hot'].map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
        </SelectContent>
      </Select>
      <Input placeholder="Image URL or Emoji" value={item.image_url || ''} onChange={e => setItem({ ...item, image_url: e.target.value })} />
      <div className="flex items-center space-x-2">
        <Label>Available</Label>
        <Switch checked={item.available || false} onCheckedChange={v => setItem({ ...item, available: v })} />
      </div>
    </div>
  );

  return (
    <div className="py-8 px-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => { setIsAdding(true); setEditingId(null); }}>
          <Plus className="mr-1" /> Add Item
        </Button>
      </div>

      {isAdding && (
        <CardHover title="Add Item">
          {renderForm(newItem, setNewItem)}
          <div className="flex space-x-2 mt-4">
            <Button onClick={handleAdd}><Save className="mr-1" /> Save</Button>
            <Button variant="outline" onClick={() => setIsAdding(false)}><X className="mr-1" /> Cancel</Button>
          </div>
        </CardHover>
      )}

      {editingId && (
        <CardHover title="Edit Item">
          {renderForm(editItem, setEditItem)}
          <div className="flex space-x-2 mt-4">
            <Button onClick={handleUpdate}><Save className="mr-1" /> Update</Button>
            <Button variant="outline" onClick={() => setEditingId(null)}><X className="mr-1" /> Cancel</Button>
          </div>
        </CardHover>
      )}

      <div className="space-y-4">
        {menuItems.map(item => (
          <CardHover key={item.id} title={item.name}>
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p>${item.price.toFixed(2)}</p>
                <div className="flex gap-2">
                  {item.is_veg && <Badge>Veg</Badge>}
                  <Badge>{item.spice_level}</Badge>
                  <Badge variant={item.available ? 'default' : 'secondary'}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => { setEditingId(item.id); setIsAdding(false); }}><Edit3 /></Button>
                <Button size="sm" variant="destructive" onClick={() => deleteMenuItem(item.id)}><Trash2 /></Button>
                <Button size="sm" onClick={() => toggleAvailability(item.id, !item.available)}>
                  {item.available ? 'Mark Unavailable' : 'Mark Available'}
                </Button>
              </div>
            </div>
          </CardHover>
        ))}
      </div>
    </div>
  );
};

export default Admin;
