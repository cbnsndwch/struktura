import { describe, it, expect } from 'vitest';

describe('Component Exports', () => {
  it('should export Button component', async () => {
    const { Button } = await import('../ui/button.js');
    expect(Button).toBeDefined();
    expect(typeof Button).toBe('object');
  });

  it('should export Card components', async () => {
    const { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } = await import('../ui/card.js');
    expect(Card).toBeDefined();
    expect(CardHeader).toBeDefined();
    expect(CardTitle).toBeDefined();
    expect(CardDescription).toBeDefined();
    expect(CardContent).toBeDefined();
    expect(CardFooter).toBeDefined();
  });

  it('should export Input component', async () => {
    const { Input } = await import('../ui/input.js');
    expect(Input).toBeDefined();
    expect(typeof Input).toBe('object');
  });

  it('should export Label component', async () => {
    const { Label } = await import('../ui/label.js');
    expect(Label).toBeDefined();
    expect(typeof Label).toBe('object');
  });

  it('should export Select components', async () => {
    const { 
      Select, 
      SelectContent, 
      SelectItem, 
      SelectTrigger, 
      SelectValue 
    } = await import('../ui/select.js');
    expect(Select).toBeDefined();
    expect(SelectContent).toBeDefined();
    expect(SelectItem).toBeDefined();
    expect(SelectTrigger).toBeDefined();
    expect(SelectValue).toBeDefined();
  });

  it('should export Dialog components', async () => {
    const { 
      Dialog, 
      DialogContent, 
      DialogHeader, 
      DialogTitle, 
      DialogDescription 
    } = await import('../ui/dialog.js');
    expect(Dialog).toBeDefined();
    expect(DialogContent).toBeDefined();
    expect(DialogHeader).toBeDefined();
    expect(DialogTitle).toBeDefined();
    expect(DialogDescription).toBeDefined();
  });

  it('should export Toaster (Sonner) component', async () => {
    const { Toaster } = await import('../ui/sonner.js');
    expect(Toaster).toBeDefined();
    expect(typeof Toaster).toBe('function');
  });
});