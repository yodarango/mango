import ResourcesClassThree from "../components/ResourcesClassThree";
import ResourcesClassTwo from "../components/ResourcesClassTwo";
import { useEffect, useState } from "react";

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

  console.log(user);

  if (user.class === 2) {
    return <ResourcesClassTwo />;
  }

  return <ResourcesClassThree />;
}

export default Resources;
