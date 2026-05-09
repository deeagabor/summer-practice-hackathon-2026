import { postCreateSchema } from "@showup2move/shared";
import { requireCurrentUser } from "@/server/auth/session";
import { handleRouteError, jsonOk, readJson } from "@/server/http";
import { createPost, listPostsByEvent } from "@/server/posts/service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    return jsonOk({ posts: listPostsByEvent(id) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await context.params;
    const rawInput = await readJson(request, postCreateSchema);
    const input = { ...rawInput, eventId: id };

    return jsonOk({ post: createPost(user.id, input) }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
