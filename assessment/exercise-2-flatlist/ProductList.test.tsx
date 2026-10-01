import { fireEvent, render, screen } from '@testing-library/react-native';

import { type Product, ProductList } from './ProductList';

const products: Product[] = Array.from({ length: 10_000 }, (_, index) => ({
  id: String(index),
  name: index === 9_999 ? 'Écharpe en laine' : `Produit ${index}`,
  price: 10 + (index % 50),
  imageUrl: `https://example.com/${index}.jpg`,
}));

describe('ProductList', () => {
  it('only mounts the first rows of a 10,000 item list', async () => {
    await render(<ProductList products={products} />);
    expect(screen.getByText('Produit 0')).toBeOnTheScreen();
    expect(screen.queryByText('Produit 500')).toBeNull();
  });

  it('filters by name, ignoring case and accents', async () => {
    await render(<ProductList products={products} />);
    await fireEvent.changeText(screen.getByLabelText('Rechercher un produit'), 'echarpe');
    expect(await screen.findByText('Écharpe en laine')).toBeOnTheScreen();
    expect(screen.queryByText('Produit 0')).toBeNull();
  });

  it('formats prices with the currency', async () => {
    await render(<ProductList products={products.slice(0, 1)} />);
    expect(screen.getByText('10,00 €')).toBeOnTheScreen();
  });
});
