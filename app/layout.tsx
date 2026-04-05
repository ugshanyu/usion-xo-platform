import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'XO 8×8',
  description: 'Multiplayer 8×8 XO — get 5 in a row to win!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="/usion-design-system.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
