import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export function GoalsPage() {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");

  const goalsQuery = useQuery({
    queryKey: ["goals"],
    queryFn: api.getGoals,
  });

  const addGoalMutation = useMutation({
    mutationFn: api.addGoal,
    onSuccess: async () => {
      setText("");
      await queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: api.deleteGoal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    addGoalMutation.mutate(text.trim());
  };

  return (
    <section className="card space-y-4">
      <h2 className="text-xl font-semibold">Goals</h2>
      <form className="flex gap-2" onSubmit={submit}>
        <input
          className="input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Add goal reminder"
        />
        <button className="btn" type="submit">
          Add
        </button>
      </form>

      {goalsQuery.isLoading ? <p>Loading goals...</p> : null}

      <ul className="space-y-2">
        {goalsQuery.data?.map((goal) => (
          <li
            className="flex items-center justify-between rounded-lg border border-slate-800 p-3"
            key={goal.id}
          >
            <span>{goal.text}</span>
            <button
              className="btn"
              onClick={() => deleteGoalMutation.mutate(goal.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
