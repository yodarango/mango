import { useEffect, useState } from "react";
import ResourcesClassTwo from "../components/ResourcesClassTwo";
import ResourcesClassThree from "../components/ResourcesClassThree";

function Resources() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) {
    return null;
  }

  if (user.class === 2) {
    return <ResourcesClassTwo />;
  }

  return <ResourcesClassThree />;
}

export default Resources;
