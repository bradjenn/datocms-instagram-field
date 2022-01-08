import { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { Canvas } from "datocms-react-ui";
import { MouseEventHandler, useEffect, useState } from "react";
import get from "lodash/get";

import { Parameters } from "./ConfigScreen";

import s from "./styles.module.css";
import { classNames } from "../utils";

type Props = {
  ctx: RenderFieldExtensionCtx;
};

const Post = ({
  onClick,
  post,
  selected,
}: {
  onClick: MouseEventHandler<HTMLDivElement>;
  post: any;
  selected: boolean;
}) => {
  let imageUrl = "";

  if (post.media_type === "VIDEO") {
    imageUrl = post.thumbnail_url;
  } else if (
    post.media_type === "CAROUSEL_ALBUM" &&
    post.children.data.length
  ) {
    imageUrl = post.children.data[0].media_url;
  } else {
    imageUrl = post.media_url;
  }

  return (
    <div
      key={post.id}
      className={classNames(selected ? s["post--selected"] : "", s["post"])}
    >
      <div
        className={s["post__image"]}
        onClick={onClick}
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
    </div>
  );
};

export default function StripePriceId({ ctx }: Props) {
  const [posts, setPosts] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState<any[]>([]);
  const parameters = ctx.plugin.attributes.parameters as Parameters;

  useEffect(() => {
    const fieldValue: any = get(ctx.formValues, ctx.fieldPath);
    const fieldJson = JSON.parse(fieldValue);

    if (fieldValue !== null) {
      setSelectedPosts(fieldJson);
    }
  }, [ctx.formValues, ctx.fieldPath]);

  const togglePostSelection = async (post: any) => {
    const newPosts = [...selectedPosts];
    const selectedIds = newPosts.map((post: any) => post.id);

    if (selectedIds.includes(post.id)) {
      const index = selectedIds.indexOf(post.id);
      newPosts.splice(index, 1);
      setSelectedPosts(newPosts);
    } else {
      newPosts.push(post);
      setSelectedPosts(newPosts);
    }

    await ctx.setFieldValue(ctx.fieldPath, JSON.stringify(newPosts));
  };

  useEffect(() => {
    async function fetchMedia() {
      const response = await fetch(
        `https://graph.instagram.com/me/media?fields=id,username,caption,thumbnail_url,permalink,timestamp,media_url,media_type,children{media_url}&access_token=${parameters.accessToken}`
      );
      const { data } = await response.json();

      setPosts(data);
    }

    fetchMedia();
  }, [parameters.accessToken]);

  const renderPosts = () => {
    const selectedIds = selectedPosts.map((post) => post.id);

    return (
      <div className={s["posts"]}>
        {posts.map((post: any) => {
          const selected = selectedIds.includes(post.id);

          return (
            <Post
              key={post.id}
              selected={selected}
              post={post}
              onClick={() => togglePostSelection(post)}
            />
          );
        })}
      </div>
    );
  };

  return <Canvas ctx={ctx}>{posts.length > 0 && renderPosts()}</Canvas>;
}
