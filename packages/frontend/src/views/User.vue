<template>
  <el-row :gutter="20">
    <div>{{ $route.params.screenName }}</div>
    <el-col :span="12">
      <section class="infinite-list" v-infinite-scroll="load" infinite-scroll-disabled="canLoad">
        <article class="profile" v-for="user in users" :key="user._id">
          <div class="identity">
            <Icon :user="user" :useUserDrawer="true"></Icon>
            <div class="names">
              <span>{{ user.name }}</span>
              <ScreenName :screenName="user.screenName"></ScreenName>
            </div>
            <WatchBtn
              :class="{ absolute: true }"
              :user="user"
              :hasText="true"
              :style="{ top: 0, right: 0 }"
            ></WatchBtn>
          </div>
          <div class="description" v-html="$activateLink(user.description)"></div>
          <div class="counts">
            <div>
              {{ user.postCount }}
              <span class="suffix">投稿数</span>
            </div>
            <div>
              {{ user.statusesCount }}
              <span class="suffix">ツイート</span>
            </div>
            <div>
              {{ user.friendsCount }}
              <span class="suffix">フォロー</span>
            </div>
            <div>
              {{ user.followersCount }}
              <span class="suffix">フォロワー</span>
            </div>
          </div>
          <div v-if="user.medias" class="images">
            <img
              :key="media.media_url_https"
              v-for="media in user.medias"
              v-lazy="media"
              class="original"
              :class="imageWidthStyle(user.medias)"
              data-zoomable
            />
          </div>
        </article>
        <Loader :shouldShowLoader="shouldShowLoader"></Loader>
      </section>
    </el-col>
    <el-col :span="8">
      <UserDrawer></UserDrawer>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.profile {
  & > div:not(:last-child) {
    padding-bottom: 1rem;
  }
  display: flex;
  flex-direction: column;
  background: white;
  background: white;
  border-radius: 0.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  padding: 1rem;

  .identity {
    display: flex;
    font-size: 1rem;
    line-height: 1.5;
    flex-direction: row;
    align-items: center;
    position: relative;
    .names {
      flex-direction: column;
      display: flex;
      padding-left: 1rem;
    }
  }
  .description {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: 500;
    display: table;
    width: 100%;
    table-layout: fixed;
  }
  .counts {
    font: bold;
    display: flex;
    justify-content: space-around;
  }
}
.suffix {
  opacity: 0.5;
  font-size: 60%;
}
.profile + .profile {
  margin-top: 1rem;
}
.images {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  & img {
    &.original {
      width: auto;
      object-fit: cover;
      height: 240px;
      max-width: 25%;
      border-radius: 0.5rem;
    }
    &.w33p {
      max-width: 33%;
    }
    &.w50p {
      max-width: 50%;
    }
    &.w100p {
      max-width: 100%;
    }
  }

  & img.original + img.original {
    padding-left: 0.5rem;
  }
}
</style>

<script>
import mediumZoom from "medium-zoom";
import Icon from "@/components/Icon.vue";
import ScreenName from "@/components/ScreenName.vue";
import UserDrawer from "@/container/UserDrawer.vue";
import Loader from "@/components/Loader.vue";
import WatchBtn from "@/components/btn/WatchBtn.vue";
import { debounce } from "../plugins/util";
import user from "../api/user";

export default {
  name: "user",
  data() {
    return {
      skip: 0,
      limit: 5,
      total: 0,
      users: [],
      isLoading: false,
      isCompletedLoading: false,
      searchOption: {
        searchWord: "",
        sort: "postCountDesc"
      }
    };
  },
  components: {
    ScreenName,
    UserDrawer,
    Icon,
    Loader,
    WatchBtn
  },
  computed: {
    canLoad() {
      return this.isCompletedLoading || this.isLoading;
    },
    shouldShowLoader() {
      return !this.isCompletedLoading && this.isLoading;
    },
    current() {
      return this.users.length;
    }
  },
  watch: {
    searchOption: {
      handler() {
        this.search();
      },
      deep: true
    }
  },
  created() {
    this.search = debounce(() => {
      this.isCompletedLoading = false;
      this.skip = 0;
      this.users = [];
      this.fetchCount();
      this.load();
    }, 100);
  },
  mounted() {
    this.fetchCount();
  },
  methods: {
    async fetchCount() {
      const { count } = await user.fetchCount({ ...this.searchOption });
      this.total = count;
    },
    async load() {
      this.isLoading = true;
      const { data, url } = await user.fetch({
        ...{ limit: this.limit, skip: this.skip, includePostNum: 4 },
        ...this.searchOption
      });
      if (data.length < 1) {
        this.isLoading = false;
        this.isCompletedLoading = true;
        return;
      }
      const expandedUsers = data.map(p => {
        const ret = p;
        ret.posts = p.posts.map(post => {
          if (post.entities) post.entities = JSON.parse(post.entities);
          return post;
        });
        ret.medias = this.takeMedias(ret.posts, {
          format: "jpg",
          name: "medium",
          count: 4
        });
        if (p.entities) ret.entities = JSON.parse(p.entities);
        return ret;
      });
      this.users = [...this.users, ...expandedUsers];
      this.skip += this.limit;
      this.isLoading = false;
      this.$ga.page({
        location: url
      });
    },
    takeMedias(tweets, { format = "jpg", name = "medium", count = 4 } = {}) {
      return tweets
        .filter(p => p.entities && p.entities.media)
        .map(p => p.entities.media)
        .map(media =>
          media.map(m => `${m.media_url_https}?format=${format}&name=${name}`)
        )
        .flat()
        .sort(() => Math.random() - Math.random())
        .slice(0, count);
    },
    imageWidthStyle(medias) {
      if (!medias) return {};
      return {
        w33p: medias.length === 3,
        w50p: medias.length === 2,
        w100p: medias.length === 1
      };
    }
  },
  updated() {
    this.$nextTick(() => {
      const images = Array.from(
        document.querySelectorAll("[data-zoomable]:not(.medium-zoom-image)")
      );
      images.map(
        img =>
          (img.onload = () =>
            !img.classList.contains("medium-zoom-image") &&
            mediumZoom(img, { background: "#000" }))
      );
    });
  }
};
</script>
