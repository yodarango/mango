import { useEffect, useState } from "react";
import AssignmentsClassTwo from "../components/AssignmentsClassTwo";
import AssignmentsClassThree from "../components/AssignmentsClassThree";

function Assignments() {
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
    return <AssignmentsClassTwo />;
  }

  return <AssignmentsClassThree />;
}

export default Assignments;
