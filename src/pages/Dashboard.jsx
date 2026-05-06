import { useEffect, useState } from "react";
import { uploadVideo } from "../lib/upload";
import { supabase } from "../lib/supabase";

function Dashboard() {

  const [file, setFile] = useState(null);

  const [title, setTitle] = useState("");

  const [clientName, setClientName] = useState("");

  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {

    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    setProjects(data || []);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleUpload = async () => {

    if (!file || !title || !clientName) {
      alert("Fill all fields");
      return;
    }

    try {

      const url = await uploadVideo(file);

      const { error } = await supabase
        .from("projects")
        .insert([
          {
            title,
            client_name: clientName,
            video_url: url,
            status: "pending",
            revision_count: 0,
            revision_limit: 2,
          },
        ]);

      if (error) {
        console.log(error);
        alert("Save failed");
        return;
      }

      alert("Uploaded!");

      setTitle("");
      setClientName("");
      setFile(null);

      fetchProjects();

    } catch (err) {

      console.log(err);

      alert("Something failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>

      <h1 className="text-4xl font-bold mb-6">
  Agency Tool
</h1>

      <input
        placeholder="Project Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Client Name"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
      />

      <br /><br />

      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleUpload}>
        Upload Project
      </button>

      <hr />

      <h2>Projects</h2>

      {projects.map((project) => (

        <div
          key={project.id}
          style={{
            border: "1px solid #ccc",
            padding: 15,
            marginBottom: 20,
          }}
        >

          <h3>{project.title}</h3>

          <p>{project.client_name}</p>

          <p>
            Status:
            {" "}
            <strong>
              {project.status}
            </strong>
          </p>

          <p>
            Revisions:
            {" "}
            <strong>
              {project.revision_count || 0}
              /
              {project.revision_limit || 2}
            </strong>
          </p>

          {project.revision_count >= project.revision_limit && (

            <p style={{ color: "red" }}>

              ⚠ Revision limit exceeded

            </p>
          )}

          <video
            src={project.video_url}
            controls
            width="400"
          />

          <br /><br />

          <a
            href={`/client/${project.id}`}
            target="_blank"
          >
            Client Review Link
          </a>

          <br /><br />

          <button
            onClick={async () => {

              await supabase
                .from("projects")
                .update({ status: "approved" })
                .eq("id", project.id);

              fetchProjects();
            }}
          >
            Approve
          </button>

          <button
            onClick={async () => {

              await supabase
                .from("projects")
                .update({
                  status: "changes requested",

                  revision_count:
                    (project.revision_count || 0) + 1,
                })
                .eq("id", project.id);

              fetchProjects();

              alert("Changes requested");
            }}
            style={{ marginLeft: 10 }}
          >
            Request Changes
          </button>

          <button
            onClick={async () => {

              await supabase
                .from("projects")
                .update({
                  revision_limit:
                    (project.revision_limit || 2) + 1,
                })
                .eq("id", project.id);

              fetchProjects();
            }}
            style={{ marginLeft: 10 }}
          >
            + Add Revision
          </button>

        </div>
      ))}

    </div>
  );
}

export default Dashboard;1