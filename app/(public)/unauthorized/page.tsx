import { useRouter } from "next/navigation";


const Unauthorized = () => {
  const router = useRouter();


  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Unauthorized</h1>
      <h1>401</h1>
      <p>{"You do not have access to this page."}</p>
      <button
        onClick={() => router.push("/")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Go to Homepage
      </button>
    </div>
  );
};

export default Unauthorized;
