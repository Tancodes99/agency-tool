import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ClientPage() {

  const { id } = useParams();

  const videoRef = useRef(null);

  const [project, setProject] = useState(null);

  const [comments, setComments] = useState([]);

  const [commentText, setCommentText] = useState("");

  const fetchProject = async () => {

    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    setProject(data);
  };

  const fetchComments = async () => {

    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    setComments(data || []);
  };

  useEffect(() => {

    fetchProject();

    fetchComments();

  }, []);

  const updateStatus = async (status) => {

    await supabase
      .from("projects")
      .update({ status })
      .eq("id", id);

    alert("Response submitted");

    fetchProject();
  };

  const addComment = async () => {

    if (!commentText) {
      return;
    }

    const currentTime = videoRef.current.currentTime;

    const minutes = Math.floor(currentTime / 60);

    const seconds = Math.floor(currentTime % 60);

    const timestamp = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

    await supabase
      .from("comments")
      .insert([
        {
          project_id: id,
          comment: commentText,
          timestamp,
        },
      ]);

    setCommentText("");

    fetchComments();
  };

  if (!project) {
    return <h1>Loading...</h1>;
  }

  return (
    <div style={{ padding: 20 }}>

      <h1>{project.title}</h1>

      <p>{project.client_name}</p>

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
        ref={videoRef}
        src={project.video_url}
        controls
        width="600"
      />

      <br /><br />

      <textarea
        placeholder="Add feedback..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        rows="4"
        cols="50"
      />

      <br /><br />

      <button onClick={addComment}>
        Add Timestamp Comment
      </button>

      <hr />

      <h2>Comments</h2>

      {comments.map((comment) => (

        <div
          key={comment.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
          }}
        >

          <button
            onClick={() => {

              const parts = comment.timestamp.split(":");

              const seconds =
                parseInt(parts[0]) * 60 +
                parseInt(parts[1]);

              videoRef.current.currentTime = seconds;

              videoRef.current.play();
            }}
            style={{
              background: "#eee",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {comment.timestamp}
          </button>

          <p>{comment.comment}</p>

        </div>
      ))}

      <hr />

      <button
        onClick={() => updateStatus("approved")}
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
            .eq("id", id);

          alert("Changes requested");

          fetchProject();
        }}
        style={{ marginLeft: 10 }}
      >
        Request Changes
      </button>

    </div>
  );
}

export default ClientPage;