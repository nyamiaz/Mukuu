<template>
  <div class="btn">
    <a class="item add" v-if="!this.watch" @click="addWatch">
      <el-tooltip placement="top" effect="light" v-if="useTooltip">
        <div slot="content">ウォッチリストに登録する</div>
        <span>
          <i class="el-icon-view"></i>
          <span v-if="this.hasText">ウォッチ</span>
        </span>
      </el-tooltip>
      <span title="ウォッチリストに登録する" v-if="!useTooltip">
        <i class="el-icon-view"></i>
        <span v-if="this.hasText">ウォッチ</span>
      </span>
    </a>
    <a class="item remove" v-if="this.watch" @click="removeWatch">
      <el-tooltip placement="top" effect="light" v-if="useTooltip">
        <div slot="content">ウォッチリストから削除する</div>
        <span>
          <i class="el-icon-view"></i>
          <span v-if="this.hasText">ウォッチ中</span>
        </span>
      </el-tooltip>
      <span title="ウォッチリストから削除する" v-if="!useTooltip">
        <i class="el-icon-view"></i>
        <span v-if="this.hasText">ウォッチ中</span>
      </span>
    </a>
  </div>
</template>

<style lang="scss" scoped>
div.btn {
  font-size: 1rem;

  &.absolute {
    position: absolute;
  }
  i + span {
    padding-left: 0.25rem;
  }
  & > .item {
    display: block;
    background: white;
    border: 1px solid #bbb;
    color: #bbb;
    border-radius: 4rem;
    line-height: 1.7;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    &.remove {
      background: #fe346e;
      border: 1px solid #fe346e;
      color: white;
    }
    & > span {
      padding: 0rem 1rem;
    }
  }
}
</style>

<script>
import { config } from "@/config";

export default {
  name: "WatchBtn",
  props: ["user", "hasText"],
  data() {
    return {
      useTooltip: config.useTooltip
    };
  },
  computed: {
    watch: {
      get() {
        const id = this.user.idStr;
        const watch = this.$store.getters["watch/find"](id);
        return !!watch;
      }
    }
  },
  methods: {
    addWatch() {
      this.$store.dispatch("watch/addWatch", this.user);
      this.$store.dispatch("saveLocalStorage");
    },
    removeWatch() {
      this.$store.dispatch("watch/removeWatch", this.user);
      this.$store.dispatch("saveLocalStorage");
    }
  }
};
</script>
