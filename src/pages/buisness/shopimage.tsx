import { useEffect, useState } from "react";
import UploadComponent from "../../components/imageupload";

export default function ShopImage() {
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem("shopId");
    console.log("shopId from localStorage:", storedId);
    setShopId(storedId);
  }, []);

  if (!shopId) {
    return <div>Loading...</div>; // Or a spinner
  }

  return (
    <div>
      <UploadComponent shopId={shopId} successRedirectDelay={2000} skipUrl="/bsignin" />
    </div>
  );
}
