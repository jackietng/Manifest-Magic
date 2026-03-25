//src/components/common/Footer.tsx
export default function Footer() {
  return (
    <footer className="flex justify-center items-center p-4">
      <p className="text-sm text-center">&copy; {new Date().getFullYear()} Manifest Magic. All rights reserved.</p>
    </footer>
  );
}
