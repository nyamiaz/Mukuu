<template>
  <el-row :gutter="20">
    <el-col :span="4" class="hidden-smartphone hidden-tablet">
      <div>
        <el-form :inline="true" @submit.native.prevent size="mini" class="right-side">
          <el-form-item>
            <Counter :current="current" :total="total" @changeCurrentNumber="changeCurrentNumber"></Counter>
          </el-form-item>
        </el-form>
      </div>
      <div class="sb">
        <Spons></Spons>
      </div>
    </el-col>
    <el-col :span="12">
      <section class="infinite-list" v-infinite-scroll="load" infinite-scroll-disabled="canLoad">
        <Post :post="post" :useDrawer="true" mediaType="flex" :key="post._id" v-for="post in posts"></Post>
        <div class="center" v-if="isEmptyWatches">ブックマークに登録がありません。</div>
        <Loader :shouldShowLoader="shouldShowLoader"></Loader>
      </section>
    </el-col>
    <el-col :span="8" class="hidden-smartphone hidden-tablet">
      <UserDrawer></UserDrawer>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
section + section {
  margin-top: 0.5rem;
}
</style>

<script>
import UserDrawer from "@/container/UserDrawer.vue";
import Post from "@/components/Post.vue";
import Loader from "@/components/Loader.vue";
import Counter from "@/components/Counter.vue";
import Spons from "@/components/sponsor/Spons.vue";

export default {
  name: "bookmark",
  data() {
    return {
      skip: 0,
      limit: 5,
      total: 0,
      posts: [],
      isLoading: false,
      isCompletedLoading: false,
      isEmptyWatches: false
    };
  },
  components: {
    UserDrawer,
    Post,
    Loader,
    Counter,
    Spons
  },
  computed: {
    canLoad() {
      return this.isCompletedLoading || this.isLoading;
    },
    shouldShowLoader() {
      return !this.isCompletedLoading && this.isLoading;
    },
    current() {
      return Math.min(this.skip, this.total);
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
    this.search = ({ skip } = {}) => {
      this.isCompletedLoading = false;
      this.isEmptyWatches = false;
      this.skip = skip || 0;
      this.posts = [];
      this.fetchCount();
      this.load();
    };
    this.bookmarks = this.$store.getters["bookmark/bookmarks"];
    if (Array.isArray(this.bookmarks)) {
      this.bookmarks = Array.from(this.bookmarks).reverse();
      this.bookmarks = this.bookmarks.map(bookmark => {
        bookmark.shouldShowDivider = false;
        return bookmark;
      });
    }
  },
  mounted() {
    this.fetchCount();
  },
  methods: {
    changeCurrentNumber(skip) {
      this.search({ skip });
    },
    async fetchCount() {
      if (!this.bookmarks.length) return;
      this.total = this.bookmarks.length;
    },
    async load() {
      this.isLoading = true;
      if (!this.bookmarks.length) {
        this.isLoading = false;
        this.isEmptyWatches = true;
        return;
      }
      const data = this.bookmarks.slice(this.skip, this.skip + this.limit);
      if (data.length < 1) {
        this.isLoading = false;
        this.isCompletedLoading = true;
        return;
      }
      this.posts = [...this.posts, ...data];
      this.skip += this.limit;
      this.isLoading = false;
    },
    openUserDrawer(postedBy) {
      if (!postedBy) return;
      const payload = { ...postedBy };
      this.$store.dispatch("drawer/initialize", payload);
      this.$store.dispatch("saveLocalStorage");
    }
  }
};
</script>
